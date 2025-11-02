import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  IFcmMessage,
  DeleteInput,
  DeleteResult,
} from '@/types/fcm/message';
import type { CreateType } from '@/actions/fcm/message/create/schema';
import type { UpdateType } from '@/actions/fcm/message/update/schema';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
    platform,
    fcmToken,
    dateType,
    startDate,
    endDate,

    sortBy = 'idx',
    order = 'desc',

    limit = 20,
    cursor,
  } = params;

  const safeLimit = Math.min(Math.max(+limit || 20, 1), 100);

  // ───────────────────────────────────
  // where (검색/필터)
  // ───────────────────────────────────
  const baseWhere: Prisma.FcmMessageWhereInput = {};

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.FcmMessageWhereInput = q
    ? {
        ...baseWhere,
        OR: [{ platform: { contains: q }, fcmToken: { contains: q } }],
      }
    : {
        ...baseWhere,
        ...(platform?.trim()
          ? { platform: { contains: platform.trim() } }
          : {}),
        ...(fcmToken?.trim()
          ? { fcmToken: { contains: fcmToken.trim() } }
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
  let keysetWhere: Prisma.FcmMessageWhereInput | undefined;
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
  const orderBy: Prisma.FcmMessageOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.FcmMessageWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.fcmMessage.findMany({
    where: whereForPage,
    orderBy,
    take: safeLimit + 1,
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      template: true,
    },
  });

  const hasMore = rows.length > safeLimit;
  const items = (hasMore ? rows.slice(0, safeLimit) : rows) as IFcmMessage[];

  let nextCursor: string | undefined;
  if (hasMore) {
    const last = items[items.length - 1] as any;
    nextCursor = b64e({ sortValue: last[sortBy], idx: last.idx });
  }

  const [totalAll, totalFiltered] = await Promise.all([
    prisma.fcmMessage.count({ where: baseWhere }),
    prisma.fcmMessage.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<IFcmMessage> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.fcmMessage.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.fcmMessage.findUnique({
    where: { uid },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      template: true,
    },
  });

  if (!rs) throw new Error('NOT_FOUND');
  return rs as IFcmMessage;
}

/** 작성 */
export async function create(input: CreateType) {
  const {
    uid,
    platform,
    templateId,
    userId,
    fcmToken,
    otCode,
    title,
    body,
    url,
  } = input;

  const exists = await prisma.fcmMessage.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${uid}`);

  const result = await prisma.$transaction(async (tx) => {
    const createData: any = {
      data: {
        uid,
        platform,
        templateId,
        userId,
        fcmToken,
        otCode,
        title,
        body,
        url,
      },
    };

    const created = await tx.fcmMessage.create(createData);

    // 관계 포함 최종 반환
    const withRelations = await tx.fcmMessage.findUnique({
      where: { uid: created.uid },
    });

    return withRelations as IFcmMessage;
  });

  return result;
}

/** 수정 */
export async function update(input: UpdateType) {
  const {
    uid,
    platform,
    templateId,
    userId,
    fcmToken,
    otCode,
    title,
    body,
    url,
  } = input;

  const exist = await prisma.fcmMessage.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (tx) => {
    const data: any = {
      uid,
      platform,
      templateId,
      userId,
      fcmToken,
      otCode,
      title,
      body,
      url,
    };

    const updated = await tx.fcmMessage.update({
      where: { uid },
      data,
    });

    return updated as IFcmMessage;
  });

  return rs;
}

/** 삭제 */
export async function remove(input: DeleteInput): Promise<DeleteResult> {
  const { uid, uids } = input;

  // 유효성
  if (!uid && (!uids || uids.length === 0)) {
    throw new Error('MISSING_ID');
  }

  // Bulk
  if (uids && uids.length > 0) {
    return await prisma.$transaction(async (tx) => {
      const rs = await tx.fcmMessage.deleteMany({
        where: { uid: { in: uids } },
      });
      return { mode: 'bulk', affected: rs.count };
    });
  }

  // Single
  const todo = await prisma.fcmMessage.findUnique({
    where: { uid: uid! },
    select: { uid: true },
  });
  if (!todo) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    const rs = await tx.fcmMessage.delete({ where: { uid: uid! } });
    return { mode: 'single', affected: rs ? 1 : 0 };
  });
}
