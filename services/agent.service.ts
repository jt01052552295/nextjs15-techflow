import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  DeleteInput,
  DeleteResult,
} from '@/types/agent';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
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
  const baseWhere: Prisma.AgentLogWhereInput = {};

  // 통합 검색(q)이 들어오면  OR 매칭. 없으면 기존  개별 필드 사용
  const filteredWhere: Prisma.AgentLogWhereInput = q
    ? {
        ...baseWhere,
        OR: [
          { browser: { contains: q } },
          { os: { contains: q } },
          { device: { contains: q } },
          { ip: { contains: q } },
        ],
      }
    : {
        ...baseWhere,
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
  let keysetWhere: Prisma.AgentLogWhereInput | undefined;
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
  const orderBy: Prisma.AgentLogOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.AgentLogWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.agentLog.findMany({
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
    prisma.agentLog.count({ where: baseWhere }),
    prisma.agentLog.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 작성 */
export async function create(input: any) {
  const {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
    ip,
    referer,
    host,
    isMobile,
    isTablet,
    isDesktop,
    isRobot,
    keyword,
  } = input;

  const now = dayjs(new Date().getTime()).toISOString();
  const oneDayAgo = dayjs().subtract(1, 'day').toISOString();

  const exists = await prisma.agentLog.findFirst({
    where: {
      ip,
      device,
      createdAt: {
        gte: oneDayAgo, // 마지막 로그가 하루 이내에 있는지 확인
      },
    },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${ip}`);

  const result = await prisma.$transaction(async (trx) => {
    const createData: any = {
      data: {
        browser,
        browserVersion,
        os,
        osVersion,
        device: device || 'Desktop', // 기기 정보가 없으면 기본값으로 'Desktop'
        ip,
        referer,
        host,
        isMobile,
        isTablet,
        isDesktop,
        isRobot,
        keyword,
      },
    };

    const created = await trx.agentLog.create(createData);

    // 관계 포함 최종 반환
    const withRelations = await trx.agentLog.findUnique({
      where: { uid: created.uid },
    });

    return withRelations!;
  });

  return result;
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
        const rs = await tx.agentLog.deleteMany({
          where: { uid: { in: uids } },
        });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.agentLog.deleteMany({
          where: { uid: { in: uids } },
        });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const todo = await prisma.agentLog.findUnique({
    where: { uid: uid! },
    select: { uid: true },
  });
  if (!todo) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    if (hard) {
      const rs = await tx.agentLog.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.agentLog.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}
