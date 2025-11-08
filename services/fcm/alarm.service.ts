import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  IFcmAlarm,
  DeleteInput,
  DeleteResult,
} from '@/types/fcm/alarm';
import type { CreateType } from '@/actions/fcm/alarm/create/schema';
import type { UpdateType } from '@/actions/fcm/alarm/update/schema';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
    templateId,
    message,
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
  const baseWhere: Prisma.FcmAlarmWhereInput = {};

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.FcmAlarmWhereInput = q
    ? {
        AND: [
          baseWhere,
          {
            OR: [{ templateId: { contains: q }, message: { contains: q } }],
          },
        ],
      }
    : {
        ...baseWhere,
        ...(templateId?.trim()
          ? { templateId: { contains: templateId.trim() } }
          : {}),
        ...(message?.trim() ? { message: { contains: message.trim() } } : {}),
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
  let keysetWhere: Prisma.FcmAlarmWhereInput | undefined;
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
  const orderBy: Prisma.FcmAlarmOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.FcmAlarmWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.fcmAlarm.findMany({
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
  const items = (hasMore ? rows.slice(0, safeLimit) : rows) as IFcmAlarm[];

  let nextCursor: string | undefined;
  if (hasMore) {
    const last = items[items.length - 1] as any;
    nextCursor = b64e({ sortValue: last[sortBy], idx: last.idx });
  }

  const [totalAll, totalFiltered] = await Promise.all([
    prisma.fcmAlarm.count({ where: baseWhere }),
    prisma.fcmAlarm.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<IFcmAlarm> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.fcmAlarm.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.fcmAlarm.findUnique({
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
  return rs as IFcmAlarm;
}

/** 작성 */
export async function create(input: CreateType) {
  const { uid, userId, templateId, message, url, isRead } = input;

  const exists = await prisma.fcmAlarm.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${uid}`);

  const result = await prisma.$transaction(async (tx) => {
    const createData: any = {
      data: {
        uid,
        userId,
        templateId,
        message,
        url,
        isRead,
      },
    };

    const created = await tx.fcmAlarm.create(createData);

    // 관계 포함 최종 반환
    const withRelations = await tx.fcmAlarm.findUnique({
      where: { uid: created.uid },
    });

    return withRelations as IFcmAlarm;
  });

  return result;
}

/** 수정 */
export async function update(input: UpdateType) {
  const { uid, userId, templateId, message, url, isRead } = input;

  const exist = await prisma.fcmAlarm.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (tx) => {
    const data: any = {
      uid,
      userId,
      templateId,
      message,
      url,
      isRead,
    };

    const updated = await tx.fcmAlarm.update({
      where: { uid },
      data,
    });

    return updated as IFcmAlarm;
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
      const rs = await tx.fcmAlarm.deleteMany({
        where: { uid: { in: uids } },
      });
      return { mode: 'bulk', affected: rs.count };
    });
  }

  // Single
  const todo = await prisma.fcmAlarm.findUnique({
    where: { uid: uid! },
    select: { uid: true },
  });
  if (!todo) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    const rs = await tx.fcmAlarm.delete({ where: { uid: uid! } });
    return { mode: 'single', affected: rs ? 1 : 0 };
  });
}
