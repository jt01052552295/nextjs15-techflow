import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  DeleteInput,
  DeleteResult,
} from '@/types/popup';
import { IPopup } from '@/types/popup';
import type { CreateType } from '@/actions/popup/create/schema';
import type { UpdateType } from '@/actions/popup/update/schema';
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
    title,
    dateType,
    startDate,
    endDate,
    isUse,
    isVisible,

    sortBy = 'sortOrder',
    order = 'desc',

    limit = 20,
    cursor,
  } = params;

  const safeLimit = Math.min(Math.max(+limit || 20, 1), 100);

  // ───────────────────────────────────
  // where (검색/필터)
  // ───────────────────────────────────
  const baseWhere: Prisma.PopupWhereInput = {
    isUse: typeof isUse === 'boolean' ? isUse : true,
    isVisible: typeof isVisible === 'boolean' ? isVisible : true,
  };

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.PopupWhereInput = q
    ? {
        ...baseWhere,
        OR: [{ title: { contains: q } }],
      }
    : {
        ...baseWhere,
        ...(title?.trim() ? { title: { contains: title.trim() } } : {}),
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
  let keysetWhere: Prisma.PopupWhereInput | undefined;
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
  const orderBy: Prisma.PopupOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.PopupWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.popup.findMany({
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
    prisma.popup.count({ where: baseWhere }),
    prisma.popup.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<IPopup> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.popup.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.popup.findUnique({
    where: { uid },
  });

  if (!rs) throw new Error('NOT_FOUND');
  return rs;
}

/** 작성 */
export async function create(input: CreateType) {
  const {
    uid,
    title,
    content = null,
    posX,
    posY,
    startTime,
    endTime,
    isUse = true,
    isVisible = true,
  } = input;

  const exists = await prisma.popup.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${uid}`);

  const sdate = dayjs(new Date(startTime).getTime()).toISOString();
  const edate = dayjs(new Date(endTime).getTime()).toISOString();

  const result = await prisma.$transaction(async (trx) => {
    const createData: any = {
      data: {
        uid,
        title,
        content,
        posX,
        posY,
        startTime: sdate,
        endTime: edate,
        isUse,
        isVisible,
      },
    };

    const created = await trx.popup.create(createData);

    // 관계 포함 최종 반환
    const withRelations = await trx.popup.findUnique({
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
    title,
    content = null,
    posX,
    posY,
    startTime,
    endTime,
    isUse,
    isVisible,
  } = input;

  const exist = await prisma.popup.findUnique({
    where: { uid, cid },
    select: { uid: true, cid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const sdate = dayjs(new Date(startTime).getTime()).toISOString();
  const edate = dayjs(new Date(endTime).getTime()).toISOString();

  const rs = await prisma.$transaction(async (tx) => {
    // 3) 본문 업데이트 + 관계 include
    const data: any = {
      title,
      content,
      posX,
      posY,
      startTime: sdate,
      endTime: edate,
      isUse,
      isVisible,
    };

    const updated = await tx.popup.update({
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
        const rs = await tx.popup.deleteMany({ where: { uid: { in: uids } } });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.popup.updateMany({
          where: { uid: { in: uids } },
          data: { isUse: false, isVisible: false },
        });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const todo = await prisma.popup.findUnique({
    where: { uid: uid! },
    select: { uid: true },
  });
  if (!todo) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    if (hard) {
      const rs = await tx.popup.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.popup.update({
        where: { uid: uid! },
        data: { isUse: false, isVisible: false },
      });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}
