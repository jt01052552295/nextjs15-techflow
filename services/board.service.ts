import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  DeleteInput,
  DeleteResult,
  IBoardListRow,
} from '@/types/board';

import type { CreateType } from '@/actions/board/create/schema';
import type { UpdateType } from '@/actions/board/update/schema';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
    bdName,
    bdTable,
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
  const baseWhere: Prisma.BoardWhereInput = {
    isUse: typeof isUse === 'boolean' ? isUse : true,
    isVisible: typeof isVisible === 'boolean' ? isVisible : true,
  };

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.BoardWhereInput = q
    ? {
        ...baseWhere,
        OR: [{ bdName: { contains: q } }, { bdTable: { contains: q } }],
      }
    : {
        ...baseWhere,
        ...(bdName?.trim() ? { bdName: { contains: bdName.trim() } } : {}),
        ...(bdTable?.trim() ? { bdTable: { contains: bdTable.trim() } } : {}),
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
  let keysetWhere: Prisma.BoardWhereInput | undefined;
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
  const orderBy: Prisma.BoardOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.BoardWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.board.findMany({
    where: whereForPage,
    orderBy,
    take: safeLimit + 1,
    include: {
      _count: {
        select: { posts: true, comments: true, files: true },
      },
    },
  });

  const hasMore = rows.length > safeLimit;
  // const items: IBoardListRow[] = hasMore ? rows.slice(0, safeLimit) : rows;

  const sliced = hasMore ? rows.slice(0, safeLimit) : rows;
  const items: IBoardListRow[] = sliced.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  let nextCursor: string | undefined;
  if (hasMore) {
    const last = items[items.length - 1] as any;
    nextCursor = b64e({ sortValue: last[sortBy], idx: last.idx });
  }

  const [totalAll, totalFiltered] = await Promise.all([
    prisma.board.count({ where: baseWhere }),
    prisma.board.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<IBoardListRow> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.board.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.board.findUnique({
    where: { uid },
    include: {
      _count: {
        select: { posts: true, comments: true, files: true },
      },
    },
  });

  if (!rs) throw new Error('NOT_FOUND');
  const dto: IBoardListRow = {
    ...rs,
    createdAt: rs.createdAt.toISOString(),
    updatedAt: rs.updatedAt.toISOString(),
  };
  return dto;
}

/** 작성 */
export async function create(input: CreateType) {
  const {
    uid,
    bdTable,
    bdName,
    bdNameEn = '',
    bdNameJa = '',
    bdNameZh = '',
    bdSkin = '',
    bdListSize = 0,
    bdFileCount = 0,
    bdNewTime = 0,
    bdSecret = false,
    bdPrivate = false,
    bdBusiness = false,
    bdUseCategory = false,
    bdCategoryList = '',
    bdFixTitle = '',
    bdListLevel = 0,
    bdReadLevel = 0,
    bdWriteLevel = 0,
    bdReplyLevel = 0,
    bdCommentLevel = 0,
    bdUploadLevel = 0,
    bdDownloadLevel = 0,
    isUse = true,
    isVisible = true,
  } = input;

  const exists = await prisma.board.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${uid}`);

  const result = await prisma.$transaction(async (tx) => {
    const createData: any = {
      data: {
        uid,
        bdTable,
        bdName,
        bdNameEn,
        bdNameJa,
        bdNameZh,
        bdSkin,
        bdListSize,
        bdFileCount,
        bdNewTime,
        bdSecret,
        bdPrivate,
        bdBusiness,
        bdUseCategory,
        bdCategoryList,
        bdFixTitle,
        bdListLevel,
        bdReadLevel,
        bdWriteLevel,
        bdReplyLevel,
        bdCommentLevel,
        bdUploadLevel,
        bdDownloadLevel,
        isUse,
        isVisible,
      },
    };

    const created = await tx.board.create(createData);

    // 정렬 기본값: sortOrder = idx
    await tx.board.update({
      where: { idx: created.idx },
      data: { sortOrder: created.idx },
    });

    // 관계 포함 최종 반환
    const withRelations = await tx.board.findUnique({
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
    bdTable,
    bdName,
    bdNameEn = '',
    bdNameJa = '',
    bdNameZh = '',
    bdSkin = '',
    bdListSize = 0,
    bdFileCount = 0,
    bdNewTime = 0,
    bdSecret = false,
    bdPrivate = false,
    bdBusiness = false,
    bdUseCategory = false,
    bdCategoryList = '',
    bdFixTitle = '',
    bdListLevel = 0,
    bdReadLevel = 0,
    bdWriteLevel = 0,
    bdReplyLevel = 0,
    bdCommentLevel = 0,
    bdUploadLevel = 0,
    bdDownloadLevel = 0,
    isUse,
    isVisible,
  } = input;

  const exist = await prisma.board.findUnique({
    where: { uid, cid },
    select: { uid: true, cid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (tx) => {
    // 3) 본문 업데이트 + 관계 include
    const data: any = {
      bdTable,
      bdName,
      bdNameEn,
      bdNameJa,
      bdNameZh,
      bdSkin,
      bdListSize,
      bdFileCount,
      bdNewTime,
      bdSecret,
      bdPrivate,
      bdBusiness,
      bdUseCategory,
      bdCategoryList,
      bdFixTitle,
      bdListLevel,
      bdReadLevel,
      bdWriteLevel,
      bdReplyLevel,
      bdCommentLevel,
      bdUploadLevel,
      bdDownloadLevel,
      isUse,
      isVisible,
    };

    const updated = await tx.board.update({
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
    // 먼저 삭제할 모든 게시판의 bdTable 값을 가져옵니다
    const boardsToDelete = await prisma.board.findMany({
      where: { uid: { in: uids } },
      select: { bdTable: true },
    });

    const bdTables = boardsToDelete.map((board) => board.bdTable);

    return await prisma.$transaction(async (tx) => {
      await tx.bBS.deleteMany({ where: { bdTable: { in: bdTables } } });
      await tx.bBSFile.deleteMany({ where: { bdTable: { in: bdTables } } });
      await tx.bBSLike.deleteMany({ where: { bdTable: { in: bdTables } } });
      await tx.bBSComment.deleteMany({ where: { bdTable: { in: bdTables } } });
      await tx.bBSCommentLike.deleteMany({
        where: { bdTable: { in: bdTables } },
      });

      if (hard) {
        const rs = await tx.board.deleteMany({ where: { uid: { in: uids } } });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.board.updateMany({
          where: { uid: { in: uids } },
          data: { isUse: false, isVisible: false },
        });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const exist = await prisma.board.findUnique({
    where: { uid: uid! },
    select: { uid: true, bdTable: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    await tx.bBS.deleteMany({ where: { bdTable: exist.bdTable } });
    await tx.bBSFile.deleteMany({ where: { bdTable: exist.bdTable } });
    await tx.bBSLike.deleteMany({ where: { bdTable: exist.bdTable } });
    await tx.bBSComment.deleteMany({ where: { bdTable: exist.bdTable } });
    await tx.bBSCommentLike.deleteMany({ where: { bdTable: exist.bdTable } });

    if (hard) {
      const rs = await tx.board.delete({ where: { bdTable: exist.bdTable } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.board.update({
        where: { bdTable: exist.bdTable },
        data: { isUse: false, isVisible: false },
      });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}
