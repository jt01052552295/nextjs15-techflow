import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  IFcmToken,
  DeleteInput,
  DeleteResult,
} from '@/types/fcm/token';
import type { CreateType } from '@/actions/fcm/token/create/schema';
import type { UpdateType } from '@/actions/fcm/token/update/schema';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
    userId,
    token,
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
  const baseWhere: Prisma.FcmTokenWhereInput = {};

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.FcmTokenWhereInput = q
    ? {
        AND: [
          baseWhere,
          {
            OR: [{ userId: { contains: q }, token: { contains: q } }],
          },
        ],
      }
    : {
        ...baseWhere,
        ...(userId?.trim() ? { userId: { contains: userId.trim() } } : {}),
        ...(token?.trim() ? { token: { contains: token.trim() } } : {}),
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
  let keysetWhere: Prisma.FcmTokenWhereInput | undefined;
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
  const orderBy: Prisma.FcmTokenOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.FcmTokenWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.fcmToken.findMany({
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
  const items = (hasMore ? rows.slice(0, safeLimit) : rows) as IFcmToken[];

  let nextCursor: string | undefined;
  if (hasMore) {
    const last = items[items.length - 1] as any;
    nextCursor = b64e({ sortValue: last[sortBy], idx: last.idx });
  }

  const [totalAll, totalFiltered] = await Promise.all([
    prisma.fcmToken.count({ where: baseWhere }),
    prisma.fcmToken.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<IFcmToken> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.fcmToken.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.fcmToken.findUnique({
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
  return rs as IFcmToken;
}

/** 작성 */
export async function create(input: CreateType) {
  const {
    uid,
    userId,
    token,
    platform,
    deviceId,
    appVersion,
    deviceInfo,
    isUse = true,
    isVisible = true,
  } = input;

  const exists = await prisma.fcmToken.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${uid}`);

  const result = await prisma.$transaction(async (tx) => {
    const createData: any = {
      data: {
        uid,
        userId,
        token,
        platform,
        deviceId,
        appVersion,
        deviceInfo,
        isUse,
        isVisible,
      },
    };

    const created = await tx.fcmToken.create(createData);

    // 관계 포함 최종 반환
    const withRelations = await tx.fcmToken.findUnique({
      where: { uid: created.uid },
    });

    return withRelations as IFcmToken;
  });

  return result;
}

/** 수정 */
export async function update(input: UpdateType) {
  const {
    uid,
    userId,
    token,
    platform,
    deviceId,
    appVersion,
    deviceInfo,
    isUse,
    isVisible,
  } = input;

  const exist = await prisma.fcmToken.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (tx) => {
    const data: any = {
      uid,
      userId,
      token,
      platform,
      deviceId,
      appVersion,
      deviceInfo,
      isUse,
      isVisible,
    };

    const updated = await tx.fcmToken.update({
      where: { uid },
      data,
    });

    return updated as IFcmToken;
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
        const rs = await tx.fcmToken.deleteMany({
          where: { uid: { in: uids } },
        });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.fcmToken.updateMany({
          where: { uid: { in: uids } },
          data: { isUse: false, isVisible: false },
        });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const todo = await prisma.fcmToken.findUnique({
    where: { uid: uid! },
    select: { uid: true },
  });
  if (!todo) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    if (hard) {
      const rs = await tx.fcmToken.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.fcmToken.update({
        where: { uid: uid! },
        data: { isUse: false, isVisible: false },
      });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}

/** 모바일 토큰 등록 (Bridge API용) */
export async function registerMobileToken(params: {
  userId: string;
  token: string;
  deviceInfo?: {
    deviceId?: string;
    model?: string;
    os?: string;
    appVersion?: string;
    osVersion?: string;
    [key: string]: any;
  };
}) {
  const { userId, token, deviceInfo = {} } = params;

  // FCM 토큰 형식 검증
  if (!token || !/^[a-zA-Z0-9:_\-]{50,}$/.test(token)) {
    throw new Error('Invalid or missing FCM token.');
  }

  // 사용자 확인
  const user = await prisma.user.findUnique({
    where: { id: userId, isUse: true, isVisible: true, isSignout: false },
    select: { id: true, idx: true },
  });

  if (!user) {
    throw new Error('사용자 정보를 찾을 수 없습니다.');
  }

  return await prisma.$transaction(async (tx) => {
    // 기존에 동일한 토큰이 있는지 확인
    const existing = await tx.fcmToken.findUnique({
      where: { token },
      select: { uid: true, userId: true },
    });

    if (existing) {
      if (existing.userId === userId) {
        throw new Error('이미 등록된 FCM 토큰입니다.');
      } else {
        // 다른 사용자의 토큰이면 삭제
        await tx.fcmToken.delete({ where: { uid: existing.uid } });
      }
    }

    // 해당 사용자의 기존 토큰이 1개 이상이면 가장 오래된 것 삭제
    const oldTokens = await tx.fcmToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { uid: true },
    });

    if (oldTokens.length >= 1) {
      const oldest = oldTokens[0];
      if (oldest?.uid) {
        await tx.fcmToken.delete({ where: { uid: oldest.uid } });
      }
    }

    // 플랫폼 결정
    const os = deviceInfo.os?.toLowerCase() || '';
    let platform: 'ios' | 'android' | 'web' = 'web';
    if (os === 'ios') {
      platform = 'ios';
    } else if (os === 'android') {
      platform = 'android';
    }

    // 새 토큰 등록
    const newToken = await tx.fcmToken.create({
      data: {
        userId,
        token,
        platform,
        deviceId: deviceInfo.deviceId || null,
        appVersion: deviceInfo.appVersion || null,
        deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
      },
    });

    return newToken;
  });
}

/** 모바일 토큰 삭제 (Bridge API용) */
export async function revokeMobileToken(params: {
  userId: string;
  token: string;
}) {
  const { userId, token } = params;

  // FCM 토큰 형식 검증
  if (!token || !/^[a-zA-Z0-9:_\-]{50,}$/.test(token)) {
    throw new Error('Invalid or missing FCM token.');
  }

  // 사용자 확인
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error('사용자 정보를 찾을 수 없습니다.');
  }

  return await prisma.$transaction(async (tx) => {
    // 토큰 존재 확인
    const existing = await tx.fcmToken.findUnique({
      where: { token },
      select: { uid: true, userId: true },
    });

    if (!existing) {
      throw new Error('이미 삭제되었거나 존재하지 않는 토큰입니다.');
    }

    // 토큰 삭제
    await tx.fcmToken.delete({ where: { uid: existing.uid } });

    return { removed: 1 };
  });
}

/** 모바일 자동 로그인 (Bridge API용) - 토큰으로 사용자 조회 */
export async function loginByToken(token: string) {
  // FCM 토큰 형식 검증
  if (!token || !/^[a-zA-Z0-9:_\-]{50,}$/.test(token)) {
    throw new Error('Invalid or missing FCM token.');
  }

  // 토큰으로 사용자 정보 조회
  const tokenData = await prisma.fcmToken.findUnique({
    where: { token },
    select: {
      userId: true,
      user: {
        select: {
          idx: true,
          id: true,
          email: true,
          name: true,
          level: true,
          role: true,
          isUse: true,
          isVisible: true,
          isSignout: true,
        },
      },
    },
  });

  if (!tokenData) {
    throw new Error('이미 삭제되었거나 존재하지 않는 토큰입니다.');
  }

  const user = tokenData.user;

  // 사용자 상태 확인
  if (!user.isUse || !user.isVisible || user.isSignout) {
    throw new Error('사용자 정보를 찾을 수 없습니다.');
  }

  return {
    idx: user.idx,
    id: user.id,
    email: user.email,
    name: user.name,
    level: user.level,
    role: user.role,
  };
}

/** 웹 토큰 등록 (Bridge API용) */
export async function registerWebToken(params: {
  userId: string;
  token: string;
  userAgent?: string;
  platform?: string;
  browser?: string;
  os?: string;
}) {
  const { userId, token, userAgent, platform, browser, os } = params;

  // FCM 토큰 형식 검증
  if (!token || !token.trim()) {
    throw new Error('Invalid or missing FCM token.');
  }

  // 사용자 확인
  const user = await prisma.user.findUnique({
    where: { idx: parseInt(userId), isUse: true, isVisible: true },
    select: { id: true, idx: true },
  });

  if (!user) {
    throw new Error('사용자 정보를 찾을 수 없습니다.');
  }

  return await prisma.$transaction(async (tx) => {
    // 기존에 동일한 토큰이 있는지 확인
    const existing = await tx.fcmToken.findUnique({
      where: { token },
      select: { uid: true },
    });

    if (existing) {
      throw new Error('이미 존재하는 토큰입니다.');
    }

    // 해당 사용자의 웹 토큰이 5개 이상이면 가장 오래된 것 삭제
    const webTokens = await tx.fcmToken.findMany({
      where: { userId: user.id, platform: 'web' },
      orderBy: { createdAt: 'asc' },
      select: { uid: true },
    });

    if (webTokens.length >= 5) {
      const oldest = webTokens[0];
      if (oldest?.uid) {
        await tx.fcmToken.delete({ where: { uid: oldest.uid } });
      }
    }

    // 디바이스 정보 구성
    const deviceInfo = {
      platform: platform || 'desktop',
      browser: browser || '',
      os: os || '',
      userAgent: userAgent?.substring(0, 500) || '',
    };

    // 새 웹 토큰 등록
    const newToken = await tx.fcmToken.create({
      data: {
        userId: user.id,
        token,
        platform: 'web',
        deviceInfo: JSON.stringify(deviceInfo),
      },
    });

    return newToken;
  });
}
