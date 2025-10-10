import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  DeleteInput,
  DeleteResult,
  IBBSCommentRow,
} from '@/types/comment';
import type { UpdateType } from '@/actions/comment/update/schema';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
    bdTable,
    author,
    dateType,
    startDate,
    endDate,
    isUse,
    isVisible,

    sortBy = 'createdAt',
    order = 'desc',

    limit = 20,
    cursor,
  } = params;

  const safeLimit = Math.min(Math.max(+limit || 20, 1), 100);

  // ───────────────────────────────────
  // where (검색/필터)
  // ───────────────────────────────────
  const baseWhere: Prisma.BBSCommentWhereInput = {
    isUse: typeof isUse === 'boolean' ? isUse : true,
    isVisible: typeof isVisible === 'boolean' ? isVisible : true,
  };

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.BBSCommentWhereInput = q
    ? {
        ...baseWhere,
        OR: [{ bdTable: { contains: q } }, { author: { contains: q } }],
      }
    : {
        ...baseWhere,
        ...(bdTable?.trim() ? { bdTable: { contains: bdTable.trim() } } : {}),
        ...(author?.trim() ? { author: { contains: author.trim() } } : {}),
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
  let keysetWhere: Prisma.BBSCommentWhereInput | undefined;
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
  const orderBy: Prisma.BBSCommentOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.BBSCommentWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.bBSComment.findMany({
    where: whereForPage,
    orderBy,
    take: safeLimit + 1,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { url: true }, take: 1 },
        },
      },
    },
  });

  const hasMore = rows.length > safeLimit;
  const sliced = hasMore ? rows.slice(0, safeLimit) : rows;
  //   const items = hasMore ? rows.slice(0, safeLimit) : rows;

  const items: IBBSCommentRow[] = sliced.map((r) => ({
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
    prisma.bBSComment.count({ where: baseWhere }),
    prisma.bBSComment.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<IBBSCommentRow> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.bBSComment.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.bBSComment.findUnique({
    where: { uid },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { url: true }, take: 1 },
        },
      },
    },
  });

  if (!rs) throw new Error('NOT_FOUND');
  const dto: IBBSCommentRow = {
    ...rs,
    createdAt: rs.createdAt.toISOString(),
    updatedAt: rs.updatedAt.toISOString(),
  };
  return dto;
}

/** 수정 */
export async function update(input: UpdateType) {
  const { uid, bdTable, author, content, isUse, isVisible } = input;

  const exist = await prisma.bBSComment.findUnique({
    where: { uid, bdTable },
    select: { uid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (tx) => {
    // 3) 본문 업데이트 + 관계 include
    const data: any = {
      bdTable,
      author,
      content,
      isUse,
      isVisible,
    };

    const updated = await tx.bBSComment.update({
      where: { uid },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: { select: { url: true }, take: 1 },
          },
        },
      },
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
    const posts = await prisma.bBSComment.findMany({
      where: { uid: { in: uids } },
      select: {
        uid: true,
        bdTable: true,
        idx: true,
        parentIdx: true,
        replyCount: true,
      },
    });

    // 답글이 있는 부모 댓글 필터링 (삭제 불가)
    const hasReplyPosts = posts.filter(
      (p) => p.parentIdx === null && p.replyCount > 0,
    );
    if (hasReplyPosts.length > 0) {
      throw new Error('REPLY_EXIST');
    }

    // 답글인 댓글들 (부모 댓글의 replyCount를 감소시켜야 함)
    const replyPosts = posts.filter((p) => p.parentIdx !== null);
    const parentIdxs = replyPosts.map((p) => p.parentIdx);

    const postUids = posts.map((p) => p.uid);
    const postIdxs = posts.map((p) => p.idx);
    const bdTables = Array.from(new Set(posts.map((p) => p.bdTable)));

    return await prisma.$transaction(async (tx) => {
      // 답글에 대한 부모 댓글의 replyCount 감소
      if (replyPosts.length > 0) {
        // 부모 댓글 별로 감소시킬 수 필요 (중복 처리)
        const parentCounts = new Map<number, number>();
        for (const post of replyPosts) {
          if (post.parentIdx) {
            parentCounts.set(
              post.parentIdx,
              (parentCounts.get(post.parentIdx) || 0) + 1,
            );
          }
        }

        // 각 부모 댓글의 replyCount 감소
        for (const [parentIdx, count] of parentCounts.entries()) {
          await tx.bBSComment.update({
            where: { idx: parentIdx },
            data: { replyCount: { decrement: count } },
          });
        }
      }

      // 댓글 좋아요 삭제
      if (postIdxs.length > 0) {
        await tx.bBSCommentLike.deleteMany({
          where: { bdTable: { in: bdTables }, parentIdx: { in: postIdxs } },
        });
      }

      if (hard) {
        const rs = await tx.bBSComment.deleteMany({
          where: { bdTable: { in: bdTables }, uid: { in: postUids } },
        });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.bBSComment.updateMany({
          where: { bdTable: { in: bdTables }, uid: { in: postUids } },
          data: { isUse: false, isVisible: false },
        });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const exist = await prisma.bBSComment.findUnique({
    where: { uid: uid! },
    select: {
      uid: true,
      bdTable: true,
      idx: true,
      parentIdx: true,
      replyCount: true,
    },
  });
  if (!exist) throw new Error('NOT_FOUND');

  // 답글이 존재하면 차단
  if (exist.parentIdx == null && exist.replyCount > 0) {
    throw new Error('REPLY_EXIST');
  }

  return await prisma.$transaction(async (tx) => {
    const commentIdxs = (
      await tx.bBSComment.findMany({
        where: { bdTable: exist.bdTable, pid: exist.uid },
        select: { idx: true },
      })
    ).map((c) => c.idx);

    if (commentIdxs.length > 0) {
      await tx.bBSCommentLike.deleteMany({
        where: { bdTable: exist.bdTable, parentIdx: { in: commentIdxs } },
      });
    }

    if (exist.parentIdx) {
      await tx.bBSComment.update({
        where: { idx: exist.parentIdx },
        data: { replyCount: { decrement: 1 } },
      });
    }

    if (hard) {
      const rs = await tx.bBSComment.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.bBSComment.update({
        where: { uid: uid! },
        data: { isUse: false, isVisible: false },
      });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}
