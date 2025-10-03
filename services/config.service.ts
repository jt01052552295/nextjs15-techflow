import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  DeleteInput,
  DeleteResult,
} from '@/types/config';
import { IConfig } from '@/types/config';
import type { CreateType } from '@/actions/config/create/schema';
import type { UpdateType } from '@/actions/config/update/schema';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
    sortBy = 'sortOrder',
    order = 'desc',

    limit = 20,
    cursor,
  } = params;

  const safeLimit = Math.min(Math.max(+limit || 20, 1), 100);

  // ───────────────────────────────────
  // where (검색/필터)
  // ───────────────────────────────────
  const baseWhere: Prisma.ConfigWhereInput = {
    CNFname: { contains: 'company' },
  };

  // 통합 검색(q)이 들어오면 매칭.
  const filteredWhere: Prisma.ConfigWhereInput = q
    ? {
        ...baseWhere,
        OR: [
          { CNFvalue: { contains: q } },
          { CNFvalue_en: { contains: q } },
          { CNFvalue_ja: { contains: q } },
          { CNFvalue_zh: { contains: q } },
        ],
      }
    : {
        ...baseWhere,
      };

  // ───────────────────────────────────
  // keyset(where) for cursor
  // (A, idx) 기준으로 "다음"을 정의:
  //   (A > a0) OR (A = a0 AND idx > i0)   // asc
  //   (A < a0) OR (A = a0 AND idx < i0)   // desc
  // ───────────────────────────────────
  let keysetWhere: Prisma.ConfigWhereInput | undefined;
  if (cursor) {
    const c = b64d(cursor) as { sortValue: any; idx: number };
    const cmpOp = order === 'asc' ? 'gt' : 'lt';

    keysetWhere = {
      OR: [
        { [sortBy]: { [cmpOp]: c.sortValue } as any },
        {
          AND: [
            { [sortBy]: { equals: c.sortValue } as any },
            { idx: { [cmpOp]: c.idx } },
          ],
        },
      ],
    };
  }

  // ───────────────────────────────────
  // orderBy
  // ───────────────────────────────────
  const orderBy: Prisma.ConfigOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.ConfigWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.config.findMany({
    where: whereForPage,
    orderBy,
    take: safeLimit + 1,
  });

  const hasMore = rows.length > safeLimit;
  const items = hasMore ? rows.slice(0, safeLimit) : rows;

  let nextCursor: string | undefined;
  if (hasMore) {
    const last = items[items.length - 1] as any;
    nextCursor = b64e({ sortValue: last[sortBy], idx: last.idx });
  }

  const [totalAll, totalFiltered] = await Promise.all([
    prisma.config.count({ where: baseWhere }),
    prisma.config.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<IConfig> {
  // 먼저 존재 확인 (선택)

  const rs = await prisma.config.findFirst({
    where: {
      CNFname: {
        contains: uid,
      },
    },
  });

  if (!rs) throw new Error('NOT_FOUND');
  return rs;
}

/** 작성 */
export async function create(input: CreateType) {
  const {
    uid,
    CNFname,
    CNFvalue = null,
    CNFvalue_en = null,
    CNFvalue_ja = null,
    CNFvalue_zh = null,
  } = input;

  const exists = await prisma.config.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${uid}`);

  const result = await prisma.$transaction(async (trx) => {
    const createData: any = {
      data: {
        uid,
        CNFname,
        CNFvalue,
        CNFvalue_en,
        CNFvalue_ja,
        CNFvalue_zh,
      },
    };

    const created = await trx.config.create(createData);

    // 정렬 기본값: sortOrder = idx
    await trx.config.update({
      where: { idx: created.idx },
      data: { sortOrder: created.idx },
    });

    // 관계 포함 최종 반환
    const withRelations = await trx.config.findUnique({
      where: { uid: created.uid },
    });

    return withRelations!;
  });

  return result;
}

/** 수정 */
export async function update(input: UpdateType) {
  const {
    uid,
    cid,
    CNFname,
    CNFvalue = null,
    CNFvalue_en = null,
    CNFvalue_ja = null,
    CNFvalue_zh = null,
  } = input;

  const exist = await prisma.config.findUnique({
    where: { uid, cid },
    select: { uid: true, cid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (tx) => {
    // 3) 본문 업데이트 + 관계 include
    const data: any = {
      CNFname,
      CNFvalue,
      CNFvalue_en,
      CNFvalue_ja,
      CNFvalue_zh,
    };

    const updated = await tx.config.update({
      where: { uid },
      data,
    });

    return updated;
  });

  return rs;
}

/** 삭제 */
export async function remove(input: DeleteInput): Promise<DeleteResult> {
  const { uid, uids, hard = false } = input;

  // 유효성
  if (!uid && (!uids || uids.length === 0)) {
    throw new Error('MISSING_ID');
  }

  // Bulk
  if (uids && uids.length > 0) {
    return await prisma.$transaction(async (tx) => {
      if (hard) {
        const rs = await tx.config.deleteMany({ where: { uid: { in: uids } } });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.config.deleteMany({ where: { uid: { in: uids } } });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const todo = await prisma.config.findUnique({
    where: { uid: uid! },
    select: { uid: true },
  });
  if (!todo) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    if (hard) {
      const rs = await tx.config.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.config.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}
