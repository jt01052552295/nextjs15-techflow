import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type { ListParams, ListResult, ISetting } from '@/types/setting';
import type { CreateType } from '@/actions/setting/create/schema';
import type { UpdateType } from '@/actions/setting/update/schema';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
    gubun,
    kepcoContract,
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
  const baseWhere: Prisma.SettingWhereInput = {
    isUse: typeof isUse === 'boolean' ? isUse : true,
    isVisible: typeof isVisible === 'boolean' ? isVisible : true,
  };

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.SettingWhereInput = q
    ? {
        ...baseWhere,
        OR: [
          { gubun: { contains: q } },
          { kepcoContract: { contains: q } },
          {
            user: {
              OR: [{ name: { contains: q } }, { email: { contains: q } }],
            },
          },
        ],
      }
    : {
        ...baseWhere,
        ...(gubun?.trim() ? { gubun: { contains: gubun.trim() } } : {}),
        ...(kepcoContract?.trim()
          ? { kepcoContract: { contains: kepcoContract.trim() } }
          : {}),
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
  let keysetWhere: Prisma.SettingWhereInput | undefined;
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
  const orderBy: Prisma.SettingOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.SettingWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.setting.findMany({
    where: whereForPage,
    orderBy,
    take: safeLimit + 1,
    include: {
      user: {
        include: {
          profile: true,
        },
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
    prisma.setting.count({ where: baseWhere }),
    prisma.setting.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<ISetting> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.setting.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.setting.findUnique({
    where: { uid },
    include: {
      // 필요 시 조건/정렬 조절
      user: true,
    },
  });

  if (!rs) throw new Error('NOT_FOUND');
  return rs;
}

/** 작성 */
export async function create(input: CreateType) {
  const {
    uid,
    userId,
    gubun,
    kepcoContract,
    kw,
    powerFactor,
    readingDate,
    efficiency,
    pushPoint,
    pushBill,
    skin,
    kepcoApi,
    kepcoMonthApi,
    isUse = true,
    isVisible = true,
  } = input;

  const exists = await prisma.setting.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${uid}`);

  const result = await prisma.$transaction(async (tx) => {
    const createData: any = {
      data: {
        uid,
        userId,
        gubun,
        kepcoContract,
        kw,
        powerFactor,
        readingDate,
        efficiency,
        pushPoint,
        pushBill,
        skin,
        kepcoApi,
        kepcoMonthApi,
        isUse,
        isVisible,
      },
    };

    const created = await tx.setting.create(createData);

    // 관계 포함 최종 반환
    const withRelations = await tx.setting.findUnique({
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
    userId,
    gubun,
    kepcoContract,
    kw,
    powerFactor,
    readingDate,
    efficiency,
    pushPoint,
    pushBill,
    skin,
    kepcoApi,
    kepcoMonthApi,
    isUse,
    isVisible,
  } = input;

  const exist = await prisma.setting.findUnique({
    where: { uid, cid },
    select: { uid: true, cid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (tx) => {
    // 3) 본문 업데이트 + 관계 include
    const data: any = {
      userId,
      gubun,
      kepcoContract,
      kw,
      powerFactor,
      readingDate,
      efficiency,
      pushPoint,
      pushBill,
      skin,
      kepcoApi,
      kepcoMonthApi,
      isUse,
      isVisible,
    };

    const updated = await tx.setting.update({
      where: { uid },
      data,
    });

    return updated;
  });

  return rs;
}
