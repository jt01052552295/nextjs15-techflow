import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  DeleteInput,
  DeleteResult,
} from '@/types/badge';
import { IBadge } from '@/types/badge';
import type { CreateType } from '@/actions/badge/create/schema';
import type { UpdateType } from '@/actions/badge/update/schema';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
    bmType,
    bmName,
    dateType,
    startDate,
    endDate,
    isUse,
    isVisible,

    sortBy = 'idx',
    order = 'desc',

    limit = 20,
    cursor,
  } = params;

  const safeLimit = Math.min(Math.max(+limit || 20, 1), 100);

  // ───────────────────────────────────
  // where (검색/필터)
  // ───────────────────────────────────
  const baseWhere: Prisma.BadgeMasterWhereInput = {
    isUse: typeof isUse === 'boolean' ? isUse : true,
    isVisible: typeof isVisible === 'boolean' ? isVisible : true,
  };

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.BadgeMasterWhereInput = q
    ? {
        ...baseWhere,
        OR: [{ bmType: { contains: q } }, { bmName: { contains: q } }],
      }
    : {
        ...baseWhere,
        ...(bmType?.trim() ? { bmType: { contains: bmType.trim() } } : {}),
        ...(bmName?.trim() ? { bmName: { contains: bmName.trim() } } : {}),
      };

  if (dateType && (startDate || endDate)) {
    const gte = startDate ? new Date(startDate) : undefined;
    const lte = endDate ? new Date(endDate) : undefined;
    if (gte || lte) {
      (filteredWhere as any)[dateType] = {
        ...(gte && { gte }),
        ...(lte && { lte }),
      };
    }
  }

  // ───────────────────────────────────
  // keyset(where) for cursor
  // (A, idx) 기준으로 "다음"을 정의:
  //   (A > a0) OR (A = a0 AND idx > i0)   // asc
  //   (A < a0) OR (A = a0 AND idx < i0)   // desc
  // ───────────────────────────────────
  let keysetWhere: Prisma.BadgeMasterWhereInput | undefined;
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
  const orderBy: Prisma.BadgeMasterOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.BadgeMasterWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.badgeMaster.findMany({
    where: whereForPage,
    orderBy,
    take: safeLimit + 1,
    include: {
      _count: {
        select: { UserBadge: true },
      },
    },
  });

  const hasMore = rows.length > safeLimit;
  const items = hasMore ? rows.slice(0, safeLimit) : rows;

  let nextCursor: string | undefined;
  if (hasMore) {
    const last = items[items.length - 1] as any;
    nextCursor = b64e({ sortValue: last[sortBy], idx: last.idx });
  }

  const [totalAll, totalFiltered] = await Promise.all([
    prisma.badgeMaster.count({ where: baseWhere }),
    prisma.badgeMaster.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<IBadge> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.badgeMaster.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.badgeMaster.findUnique({
    where: { uid },
    include: {
      // 필요 시 조건/정렬 조절
      UserBadge: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!rs) throw new Error('NOT_FOUND');
  return rs;
}

/** 작성 */
export async function create(input: CreateType) {
  const {
    uid,
    bmType,
    bmCategory,
    bmLevel,
    bmThreshold,
    bmName,
    img1 = null,
    isUse = true,
    isVisible = true,
  } = input;

  const exists = await prisma.badgeMaster.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${uid}`);

  const result = await prisma.$transaction(async (trx) => {
    const createData: any = {
      data: {
        uid,
        bmType,
        bmCategory,
        bmLevel,
        bmThreshold,
        bmName,
        img1,
        isUse,
        isVisible,
      },
    };

    const created = await trx.badgeMaster.create(createData);
    return created;
  });

  return result;
}

/** 수정 */
export async function update(input: UpdateType) {
  const {
    uid,
    bmType,
    bmCategory,
    bmLevel,
    bmThreshold,
    bmName,
    img1 = null,
    isUse,
    isVisible,
  } = input;

  const exist = await prisma.badgeMaster.findUnique({
    where: { uid },
    select: { uid: true, img1: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (trx) => {
    let imageAction: 'keep' | 'delete' | 'upload' = 'keep';
    let finalImg1: string | null = exist.img1;
    if (img1 === null && exist.img1) {
      imageAction = 'delete';
      finalImg1 = null;
    } else if (img1 && img1 !== exist.img1) {
      imageAction = 'upload';
      finalImg1 = img1;
    } else if (img1 === exist.img1) {
      imageAction = 'keep';
      finalImg1 = exist.img1;
    }

    console.log(`Image action: ${imageAction}`);

    // 3) 본문 업데이트 + 관계 include
    const data: any = {
      bmType,
      bmCategory,
      bmLevel,
      bmThreshold,
      bmName,
      img1: finalImg1,
      isUse,
      isVisible,
    };

    const updated = await trx.badgeMaster.update({
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
      // 관련 자식들 정리(파일/댓글/옵션) - FK가 uid(todoId)면 in으로
      await tx.userBadge.deleteMany({ where: { badgeId: { in: uids } } });

      if (hard) {
        const rs = await tx.badgeMaster.deleteMany({
          where: { uid: { in: uids } },
        });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.badgeMaster.updateMany({
          where: { uid: { in: uids } },
          data: { isUse: false, isVisible: false },
        });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const todo = await prisma.badgeMaster.findUnique({
    where: { uid: uid! },
    select: { uid: true },
  });
  if (!todo) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    await tx.userBadge.deleteMany({ where: { badgeId: uid! } });

    if (hard) {
      const rs = await tx.badgeMaster.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.badgeMaster.update({
        where: { uid: uid! },
        data: { isUse: false, isVisible: false },
      });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}
