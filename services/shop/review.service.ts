import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  DeleteInput,
  DeleteResult,
} from '@/types/shop/review';
import { IShopReview } from '@/types/shop/review';
import type { CreateType } from '@/actions/shop/review/create/schema';
import type { UpdateType } from '@/actions/shop/review/update/schema';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
    name,
    email,
    dateType,
    startDate,
    endDate,
    isUse,
    isVisible,

    sortBy = 'idx',
    order = 'asc',

    limit = 20,
    cursor,
  } = params;

  const safeLimit = Math.min(Math.max(+limit || 20, 1), 100);

  // ───────────────────────────────────
  // where (검색/필터)
  // ───────────────────────────────────
  const baseWhere: Prisma.ShopReviewWhereInput = {
    isUse: typeof isUse === 'boolean' ? isUse : true,
    isVisible: typeof isVisible === 'boolean' ? isVisible : true,
  };

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.ShopReviewWhereInput = q
    ? {
        ...baseWhere,
        OR: [{ name: { contains: q } }, { email: { contains: q } }],
      }
    : {
        ...baseWhere,
        ...(name?.trim() ? { name: { contains: name.trim() } } : {}),
        ...(email?.trim() ? { email: { contains: email.trim() } } : {}),
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
  let keysetWhere: Prisma.ShopReviewWhereInput | undefined;
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
  const orderBy: Prisma.ShopReviewOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.ShopReviewWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.shopReview.findMany({
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
    prisma.shopReview.count({ where: baseWhere }),
    prisma.shopReview.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<IShopReview> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.shopReview.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.shopReview.findUnique({
    where: { uid },
    include: {
      user: {
        include: {
          profile: true,
        },
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
    orderId = null,
    itemId,
    userId = null,
    name = null,
    email = null,
    subject,
    content,
    score,
    isUse = true,
    isVisible = true,
    isSecret = false,
    isAdmin = false,
  } = input;

  // UID 중복 체크
  const exists = await prisma.shopReview.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${uid}`);

  const result = await prisma.$transaction(async (tx) => {
    const createData: any = {
      data: {
        uid,
        orderId,
        itemId,
        userId,
        name,
        email,
        subject,
        content,
        score,
        isUse,
        isVisible,
        isSecret,
        isAdmin,
      },
      include: {
        ShopOrder: true,
        ShopItem: true,
        user: true,
      },
    };

    // 생성 + 관계 포함해서 바로 반환
    const created = await tx.shopReview.create(createData);
    return created;
  });

  return result;
}

/** 수정 */
export async function update(input: UpdateType) {
  const {
    uid,
    orderId,
    itemId,
    userId,
    name,
    email,
    subject,
    content,
    score,
    isUse,
    isVisible,
    isSecret,
    isAdmin,
  } = input;

  const exist = await prisma.shopReview.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (tx) => {
    // 3) 본문 업데이트 + 관계 include
    const data: any = {
      orderId,
      itemId,
      userId,
      name,
      email,
      subject,
      content,
      score,
      isUse,
      isVisible,
      isSecret,
      isAdmin,
    };

    const updated = await tx.shopReview.update({
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
        const rs = await tx.shopReview.deleteMany({
          where: { uid: { in: uids } },
        });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.shopReview.updateMany({
          where: { uid: { in: uids } },
          data: { isUse: false, isVisible: false },
        });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const row = await prisma.shopReview.findUnique({
    where: { uid: uid! },
    select: { uid: true },
  });
  if (!row) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    if (hard) {
      const rs = await tx.shopReview.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.shopReview.update({
        where: { uid: uid! },
        data: { isUse: false, isVisible: false },
      });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}
