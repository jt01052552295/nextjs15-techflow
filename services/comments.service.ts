import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type { CommentListParams, CommentListResult } from '@/types/practice';
import type { ITodosCommentPart } from '@/types/todos';
import { v4 as uuidv4 } from 'uuid';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 * - parentIdx가 지정되면(답글 목록) 정렬 기본값은 createdAt ASC 권장
 */
export async function listComments(
  params: CommentListParams,
): Promise<CommentListResult> {
  const {
    todoId,
    parentIdx = null,
    sortBy = parentIdx !== null ? 'createdAt' : 'createdAt',
    order = parentIdx !== null ? 'asc' : 'desc',
    limit = 20,
    cursor,
    currentUserId,
  } = params;

  const safeLimit = Math.min(Math.max(+limit || 20, 1), 100);
  // baseWhere: todo 전체 집계용 (루트/답글 모두 포함)
  const baseWhere: Prisma.TodosCommentWhereInput = { todoId };

  // filteredWhere: 실제 페이지 조회용 (루트 or 특정 부모)
  const filteredWhere: Prisma.TodosCommentWhereInput = {
    todoId,
    parentIdx: parentIdx ?? null,
  };

  // ───────────────────────────────────
  // keyset(where) for cursor
  // (A, idx) 기준으로 "다음"을 정의:
  //   (A > a0) OR (A = a0 AND idx > i0)   // asc
  //   (A < a0) OR (A = a0 AND idx < i0)   // desc
  // ───────────────────────────────────
  let keysetWhere: Prisma.TodosCommentWhereInput | undefined;
  if (cursor) {
    const c = b64d(cursor) as { sortValue: any; idx: number };
    const cmpOp: 'gt' | 'lt' = order === 'asc' ? 'gt' : 'lt';

    keysetWhere = {
      OR: [
        { [sortBy]: { [cmpOp]: c.sortValue } as any },
        {
          AND: [
            { [sortBy]: { equals: c.sortValue } as any },
            { idx: { [cmpOp]: c.idx } as any },
          ],
        },
      ],
    };
  }

  // orderBy: (sortBy, idx) 동일 방향 (tie-breaker)
  const orderBy: Prisma.TodosCommentOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order },
  ];

  const whereForPage: Prisma.TodosCommentWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  // ───────────────────────────────────
  // 조회(+1로 다음 페이지 유무 확인)
  // ───────────────────────────────────
  const rows = await prisma.todosComment.findMany({
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
  const pageItems = hasMore ? rows.slice(0, safeLimit) : rows;

  // nextCursor
  let nextCursor: string | undefined;
  if (hasMore) {
    const last: any = pageItems[pageItems.length - 1];
    nextCursor = b64e({ sortValue: last[sortBy], idx: last.idx });
  }

  // isLiked / isMine 주입 (선택)
  let likedSet: Set<number> | undefined;
  if (currentUserId && pageItems.length) {
    const ids = pageItems.map((r) => r.idx);
    const likes = await prisma.todosCommentLike.findMany({
      where: { commentId: { in: ids }, userId: currentUserId },
      select: { commentId: true },
    });
    likedSet = new Set(likes.map((l) => l.commentId));
  }

  const items: ITodosCommentPart[] = pageItems.map((r) => ({
    idx: r.idx,
    uid: r.uid,
    parentIdx: r.parentIdx,
    todoId: r.todoId,
    author: r.author,
    content: r.content,
    content2: r.content2,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    likeCount: r.likeCount,
    replyCount: r.replyCount,
    user: r.user
      ? {
          id: (r.user as any).id,
          name: r.user.name ?? '',
          email: r.user.email ?? '',
          profile: r.user.profile,
        }
      : undefined,
    isMine: currentUserId ? r.author === currentUserId : undefined,
    isLiked: currentUserId ? (likedSet?.has(r.idx) ?? false) : undefined,
  }));

  // 카운트 2종
  const [totalAll, totalFiltered] = await Promise.all([
    prisma.todosComment.count({ where: baseWhere }),
    prisma.todosComment.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 작성 */
export async function createComment(input: ITodosCommentPart) {
  const { todoId, author, content, parentIdx = null } = input;

  const result = await prisma.$transaction(async (trx) => {
    const createData: any = {
      data: {
        uid: uuidv4(),
        todoId,
        author,
        content,
        content2: content,
        parentIdx,
      },
      select: { idx: true },
    };

    const created = await trx.todosComment.create(createData);

    // 2) 답글이면 부모 replyCount +1
    if (parentIdx) {
      await trx.todosComment.update({
        where: { idx: parentIdx },
        data: { replyCount: { increment: 1 } },
      });
    }

    return created;
  });

  return result;
}

/** 수정 */
export async function updateComment(input: ITodosCommentPart) {
  const { uid, author, content, content2 } = input;

  // 존재+소유자 조건 동시검증 후  업데이트
  const rs = await prisma.todosComment.updateMany({
    where: { uid, author },
    data: {
      ...(content !== undefined ? { content } : {}),
      ...(content2 !== undefined ? { content2 } : {}),
    },
  });

  if (rs.count === 0) {
    return { updated: false as const };
  }
  return { updated: true as const };
}

/** 단일 삭제: 루트댓글에 답글 있으면 차단, 답글은 삭제 허용 */
export async function deleteCommentByUid(input: { commentUid: string }) {
  const { commentUid } = input;

  return prisma.$transaction(async (tx) => {
    const target = await tx.todosComment.findUnique({
      where: { uid: commentUid },
      select: {
        idx: true,
        uid: true,
        parentIdx: true,
        author: true,
        replyCount: true,
      },
    });
    if (!target) return { deleted: 0 as const, notFound: true as const };

    // 답글이 존재하면 차단
    if (target.parentIdx == null && target.replyCount > 0) {
      return { deleted: 0 as const, blockedDueToReplies: true as const };
    }

    // 좋아요 정리
    await tx.todosCommentLike.deleteMany({ where: { commentId: target.idx } });

    // 삭제
    await tx.todosComment.delete({ where: { idx: target.idx } });

    // 부모 replyCount 보정 (답글 삭제인 경우만)
    if (target.parentIdx) {
      await tx.todosComment.update({
        where: { idx: target.parentIdx },
        data: { replyCount: { decrement: 1 } },
      });
    }

    return { deleted: 1 as const };
  });
}

/** 복수 삭제: 루트 중 답글 있는 애들은 건너뛰고, 나머지만 삭제 */
export async function deleteManyCommentsByUids(input: {
  commentUids: string[];
}) {
  const { commentUids } = input;
  if (!commentUids.length)
    return { deleted: 0, skipped: [], blocked: [], notFound: [] };

  return prisma.$transaction(async (tx) => {
    const targets = await tx.todosComment.findMany({
      where: { uid: { in: commentUids } },
      select: {
        idx: true,
        uid: true,
        parentIdx: true,
        author: true,
        replyCount: true,
      },
    });

    const foundUids = new Set(targets.map((t) => t.uid));
    const notFound = commentUids.filter((u) => !foundUids.has(u));

    // ✅ 삭제 가능/차단 분류
    const deletable = targets.filter(
      (t) => !(t.parentIdx == null && t.replyCount > 0),
    );
    const blocked = targets
      .filter((t) => t.parentIdx == null && t.replyCount > 0)
      .map((t) => t.uid);
    const skipped: string[] = []; // 정책상 따로 둘 수 있음(지금은 blocked와 동일 의미)

    if (deletable.length === 0) {
      return { deleted: 0, skipped, blocked, notFound };
    }

    const deletableIds = deletable.map((t) => t.idx);

    // 좋아요 삭제
    await tx.todosCommentLike.deleteMany({
      where: { commentId: { in: deletableIds } },
    });

    // 부모 replyCount 보정(답글만 대상)
    const decMap = new Map<number, number>();
    for (const t of deletable) {
      if (t.parentIdx)
        decMap.set(t.parentIdx, (decMap.get(t.parentIdx) ?? 0) + 1);
    }
    await Promise.all(
      Array.from(decMap.entries()).map(([pid, dec]) =>
        tx.todosComment.update({
          where: { idx: pid },
          data: { replyCount: { decrement: dec } },
        }),
      ),
    );

    // 실제 삭제
    const rs = await tx.todosComment.deleteMany({
      where: { idx: { in: deletableIds } },
    });

    return { deleted: rs.count, skipped, blocked, notFound };
  });
}

/** 좋아요 */
export async function likeComment(input: {
  commentIdx: number;
  userId: string;
}) {
  const { commentIdx, userId } = input;

  return prisma.$transaction(async (tx) => {
    // 댓글 존재 확인 (없으면 에러로 처리)
    const exists = await tx.todosComment.findUnique({
      where: { idx: commentIdx },
      select: { idx: true },
    });
    if (!exists) {
      return {
        ok: false as const,
        reason: 'NOT_FOUND' as const,
        liked: false,
        likeCount: 0,
      };
    }

    const prev = await tx.todosCommentLike.findUnique({
      where: { commentId_userId: { commentId: commentIdx, userId } },
      select: { commentId: true },
    });

    if (prev) {
      await tx.todosCommentLike.delete({
        where: { commentId_userId: { commentId: commentIdx, userId } },
      });
      await tx.todosComment.update({
        where: { idx: commentIdx },
        data: { likeCount: { decrement: 1 } },
      });
    } else {
      await tx.todosCommentLike.create({
        data: { commentId: commentIdx, userId },
      });
      await tx.todosComment.update({
        where: { idx: commentIdx },
        data: { likeCount: { increment: 1 } },
      });
    }

    const { likeCount } = (await tx.todosComment.findUnique({
      where: { idx: commentIdx },
      select: { likeCount: true },
    }))!;

    return { ok: true as const, liked: !prev, likeCount };
  });
}
