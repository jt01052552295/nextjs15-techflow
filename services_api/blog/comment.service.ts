/**
 * API v1 전용 Comment Service
 * ⚠️ 웹용 services/blog/comment.service.ts와 별도 관리
 */

import prisma from '@/lib/prisma';
import { b64e, b64d, getFullImageUrl } from '@/lib/util';
import type {
  ICommentResponse,
  IPostAuthor,
  ICursorPagination,
} from '@/types_api/posts';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// 헬퍼 함수
// ============================================

/**
 * User → IPostAuthor 변환
 */
function toCommentAuthor(user: any): IPostAuthor {
  return {
    id: user.id,
    username: user.username,
    name: user.name || '',
    nick: user.nick,
    profileImage: getFullImageUrl(user.profileImage),
  };
}

/**
 * BlogPostComment → ICommentResponse 변환
 */
function toCommentResponse(
  comment: any,
  likedCommentIds: Set<number>,
): ICommentResponse {
  return {
    uid: comment.uid,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    author: toCommentAuthor(comment.user),
    depth: comment.depth,
    parentIdx: comment.parentIdx,
    metrics: {
      likeCount: comment.likeCount,
      replyCount: comment.replyCount,
    },
    isLiked: likedCommentIds.has(comment.idx),
  };
}

// ============================================
// 목록 조회
// ============================================

interface GetCommentsParams {
  cursor?: string;
  limit?: number;
  userId: string;
}

/**
 * 게시물 댓글 목록 (depth 1만, 대댓글은 별도 API 또는 확장)
 */
export async function getComments(
  postUid: string,
  params: GetCommentsParams,
): Promise<ICursorPagination<ICommentResponse>> {
  const { cursor, limit = 20, userId } = params;
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  // 게시물 조회
  const post = await prisma.blogPost.findUnique({
    where: { uid: postUid, isUse: true },
    select: { idx: true },
  });

  if (!post) {
    return { items: [], nextCursor: null, hasMore: false };
  }

  // keyset pagination
  let keysetWhere = {};
  if (cursor) {
    const c = b64d(cursor) as { createdAt: string; idx: number };
    keysetWhere = {
      OR: [
        { createdAt: { gt: new Date(c.createdAt) } },
        {
          AND: [
            { createdAt: { equals: new Date(c.createdAt) } },
            { idx: { gt: c.idx } },
          ],
        },
      ],
    };
  }

  const where = {
    postId: post.idx,
    isUse: true,
    isVisible: true,
    depth: 1, // 최상위 댓글만
    ...keysetWhere,
  };

  const comments = await prisma.blogPostComment.findMany({
    where,
    orderBy: [{ createdAt: 'asc' }, { idx: 'asc' }], // 댓글은 오래된 순
    take: safeLimit + 1,
    include: {
      user: true,
    },
  });

  const hasMore = comments.length > safeLimit;
  const items = hasMore ? comments.slice(0, safeLimit) : comments;

  // 현재 유저의 좋아요 상태 조회
  const commentIds = items.map((c) => c.idx);
  const likes = await prisma.blogPostCommentLike.findMany({
    where: { userId, commentId: { in: commentIds } },
    select: { commentId: true },
  });
  const likedCommentIds = new Set(likes.map((l) => l.commentId));

  let nextCursor: string | null = null;
  if (hasMore && items.length > 0) {
    const last = items[items.length - 1];
    nextCursor = b64e({
      createdAt: last.createdAt.toISOString(),
      idx: last.idx,
    });
  }

  return {
    items: items.map((comment) => toCommentResponse(comment, likedCommentIds)),
    nextCursor,
    hasMore,
  };
}

/**
 * 대댓글 목록 (특정 댓글의 replies)
 */
export async function getReplies(
  parentIdx: number,
  params: GetCommentsParams,
): Promise<ICursorPagination<ICommentResponse>> {
  const { cursor, limit = 20, userId } = params;
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  let keysetWhere = {};
  if (cursor) {
    const c = b64d(cursor) as { createdAt: string; idx: number };
    keysetWhere = {
      OR: [
        { createdAt: { gt: new Date(c.createdAt) } },
        {
          AND: [
            { createdAt: { equals: new Date(c.createdAt) } },
            { idx: { gt: c.idx } },
          ],
        },
      ],
    };
  }

  const where = {
    parentIdx,
    isUse: true,
    isVisible: true,
    depth: 2,
    ...keysetWhere,
  };

  const comments = await prisma.blogPostComment.findMany({
    where,
    orderBy: [{ createdAt: 'asc' }, { idx: 'asc' }],
    take: safeLimit + 1,
    include: {
      user: true,
    },
  });

  const hasMore = comments.length > safeLimit;
  const items = hasMore ? comments.slice(0, safeLimit) : comments;

  const commentIds = items.map((c) => c.idx);
  const likes = await prisma.blogPostCommentLike.findMany({
    where: { userId, commentId: { in: commentIds } },
    select: { commentId: true },
  });
  const likedCommentIds = new Set(likes.map((l) => l.commentId));

  let nextCursor: string | null = null;
  if (hasMore && items.length > 0) {
    const last = items[items.length - 1];
    nextCursor = b64e({
      createdAt: last.createdAt.toISOString(),
      idx: last.idx,
    });
  }

  return {
    items: items.map((comment) => toCommentResponse(comment, likedCommentIds)),
    nextCursor,
    hasMore,
  };
}

// ============================================
// 단건 조회
// ============================================

/**
 * 댓글 상세 조회
 */
export async function getCommentByUid(
  uid: string,
  userId: string,
): Promise<ICommentResponse | null> {
  const comment = await prisma.blogPostComment.findUnique({
    where: { uid, isUse: true, isVisible: true },
    include: {
      user: true,
    },
  });

  if (!comment) return null;

  const like = await prisma.blogPostCommentLike.findUnique({
    where: { commentId_userId: { commentId: comment.idx, userId } },
  });

  const likedCommentIds = new Set(like ? [comment.idx] : []);

  return toCommentResponse(comment, likedCommentIds);
}

// ============================================
// 생성 / 수정 / 삭제
// ============================================

interface CreateCommentData {
  content: string;
  parentIdx?: number; // 대댓글인 경우
}

/**
 * 댓글 작성
 */
export async function createComment(
  postUid: string,
  userId: string,
  data: CreateCommentData,
): Promise<ICommentResponse | null> {
  const { content, parentIdx } = data;

  const post = await prisma.blogPost.findUnique({
    where: { uid: postUid, isUse: true },
    select: { idx: true, commentCount: true },
  });

  if (!post) return null;

  const depth = parentIdx ? 2 : 1;

  const result = await prisma.$transaction(async (tx) => {
    const comment = await tx.blogPostComment.create({
      data: {
        uid: uuidv4(),
        postId: post.idx,
        userId,
        content,
        depth,
        parentIdx,
        isUse: true,
        isVisible: true,
        status: 'APPROVED',
      },
      include: {
        user: true,
      },
    });

    // 게시물 댓글 수 증가
    await tx.blogPost.update({
      where: { idx: post.idx },
      data: { commentCount: { increment: 1 } },
    });

    // 대댓글인 경우 부모 댓글의 replyCount 증가
    if (parentIdx) {
      await tx.blogPostComment.update({
        where: { idx: parentIdx },
        data: { replyCount: { increment: 1 } },
      });
    }

    return comment;
  });

  return toCommentResponse(result, new Set());
}

/**
 * 댓글 수정
 */
export async function updateComment(
  uid: string,
  userId: string,
  content: string,
): Promise<ICommentResponse | null> {
  const comment = await prisma.blogPostComment.findUnique({
    where: { uid },
    select: { idx: true, userId: true },
  });

  if (!comment) return null;
  if (comment.userId !== userId) {
    throw new Error('NOT_OWNER');
  }

  const updated = await prisma.blogPostComment.update({
    where: { uid },
    data: { content },
    include: {
      user: true,
    },
  });

  const like = await prisma.blogPostCommentLike.findUnique({
    where: { commentId_userId: { commentId: updated.idx, userId } },
  });

  const likedCommentIds = new Set(like ? [updated.idx] : []);

  return toCommentResponse(updated, likedCommentIds);
}

/**
 * 댓글 삭제 (soft delete)
 */
export async function deleteComment(
  uid: string,
  userId: string,
): Promise<boolean> {
  const comment = await prisma.blogPostComment.findUnique({
    where: { uid },
    select: {
      idx: true,
      userId: true,
      postId: true,
      parentIdx: true,
      depth: true,
    },
  });

  if (!comment) return false;
  if (comment.userId !== userId) {
    throw new Error('NOT_OWNER');
  }

  await prisma.$transaction(async (tx) => {
    // 댓글 soft delete
    await tx.blogPostComment.update({
      where: { uid },
      data: { isUse: false, isVisible: false },
    });

    // 게시물 댓글 수 감소
    await tx.blogPost.update({
      where: { idx: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });

    // 대댓글인 경우 부모 댓글의 replyCount 감소
    if (comment.parentIdx && comment.depth === 2) {
      await tx.blogPostComment.update({
        where: { idx: comment.parentIdx },
        data: { replyCount: { decrement: 1 } },
      });
    }
  });

  return true;
}

// ============================================
// 좋아요
// ============================================

interface ToggleResult {
  toggled: boolean;
  count: number;
}

/**
 * 댓글 좋아요 토글
 */
export async function toggleCommentLike(
  commentIdx: number,
  userId: string,
): Promise<ToggleResult | null> {
  const comment = await prisma.blogPostComment.findUnique({
    where: { idx: commentIdx, isUse: true },
    select: { idx: true, likeCount: true },
  });

  if (!comment) return null;

  const existing = await prisma.blogPostCommentLike.findUnique({
    where: { commentId_userId: { commentId: comment.idx, userId } },
  });

  if (existing) {
    // 삭제
    await prisma.$transaction([
      prisma.blogPostCommentLike.delete({
        where: { commentId_userId: { commentId: comment.idx, userId } },
      }),
      prisma.blogPostComment.update({
        where: { idx: comment.idx },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return { toggled: false, count: Math.max(0, comment.likeCount - 1) };
  } else {
    // 추가
    await prisma.$transaction([
      prisma.blogPostCommentLike.create({
        data: { commentId: comment.idx, userId },
      }),
      prisma.blogPostComment.update({
        where: { idx: comment.idx },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    return { toggled: true, count: comment.likeCount + 1 };
  }
}

/**
 * 댓글 UID로 좋아요 토글 (API에서 uid 사용 시)
 */
export async function toggleCommentLikeByUid(
  commentUid: string,
  userId: string,
): Promise<ToggleResult | null> {
  const comment = await prisma.blogPostComment.findUnique({
    where: { uid: commentUid, isUse: true },
    select: { idx: true },
  });

  if (!comment) return null;

  return toggleCommentLike(comment.idx, userId);
}
