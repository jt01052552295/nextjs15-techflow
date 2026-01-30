/**
 * API v1 전용 Post Service
 * ⚠️ 웹용 services/blog/post.service.ts와 별도 관리
 */

import prisma from '@/lib/prisma';
import { b64e, b64d, getFullImageUrl } from '@/lib/util';
import type {
  IPostResponse,
  IPostAuthor,
  IPostImage,
  IPostCreateRequest,
  IPostUpdateRequest,
  ICursorPagination,
} from '@/types_api/posts';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// 헬퍼 함수
// ============================================

/**
 * User → IPostAuthor 변환
 */
function toPostAuthor(user: any): IPostAuthor {
  return {
    id: user.id,
    username: user.username,
    name: user.name || '',
    nick: user.nick,
    profileImage: getFullImageUrl(user.profileImage),
  };
}

/**
 * BlogPostImage → IPostImage 변환
 */
function toPostImage(image: any): IPostImage {
  return {
    uid: image.uid,
    url: getFullImageUrl(image.url) || image.url,
    type: image.type,
  };
}

/**
 * 게시물 → IPostResponse 변환
 */
function toPostResponse(
  post: any,
  userId: string,
  likedPostIds: Set<number>,
  bookmarkedPostIds: Set<number>,
): IPostResponse {
  return {
    uid: post.uid,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    author: toPostAuthor(post.user),
    images: (post.images || []).map(toPostImage),
    metrics: {
      likeCount: post.likeCount,
      commentCount: post.commentCount,
    },
    isLiked: likedPostIds.has(post.idx),
    isBookmarked: bookmarkedPostIds.has(post.idx),
  };
}

// ============================================
// 목록 조회
// ============================================

interface GetPostsParams {
  cursor?: string;
  limit?: number;
  userId: string;
}

/**
 * 피드 목록 (전체 공개 게시물)
 */
export async function getPosts(
  params: GetPostsParams,
): Promise<ICursorPagination<IPostResponse>> {
  const { cursor, limit = 20, userId } = params;
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  // keyset pagination
  let keysetWhere = {};
  if (cursor) {
    const c = b64d(cursor) as { createdAt: string; idx: number };
    keysetWhere = {
      OR: [
        { createdAt: { lt: new Date(c.createdAt) } },
        {
          AND: [
            { createdAt: { equals: new Date(c.createdAt) } },
            { idx: { lt: c.idx } },
          ],
        },
      ],
    };
  }

  const where = {
    isUse: true,
    isVisible: true,
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    ...keysetWhere,
  };

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { idx: 'desc' }],
    take: safeLimit + 1,
    include: {
      user: true,
      images: { orderBy: { createdAt: 'asc' } },
    },
  });

  const hasMore = posts.length > safeLimit;
  const items = hasMore ? posts.slice(0, safeLimit) : posts;

  // 현재 유저의 좋아요/북마크 상태 조회
  const postIds = items.map((p) => p.idx);
  const [likes, bookmarks] = await Promise.all([
    prisma.blogPostLike.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    }),
    prisma.blogPostBookmark.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    }),
  ]);

  const likedPostIds = new Set(likes.map((l) => l.postId));
  const bookmarkedPostIds = new Set(bookmarks.map((b) => b.postId));

  let nextCursor: string | null = null;
  if (hasMore && items.length > 0) {
    const last = items[items.length - 1];
    nextCursor = b64e({
      createdAt: last.createdAt.toISOString(),
      idx: last.idx,
    });
  }

  return {
    items: items.map((post) =>
      toPostResponse(post, userId, likedPostIds, bookmarkedPostIds),
    ),
    nextCursor,
    hasMore,
  };
}

/**
 * 특정 유저 게시물 목록
 */
export async function getUserPosts(
  targetUserId: string,
  params: GetPostsParams,
): Promise<ICursorPagination<IPostResponse>> {
  const { cursor, limit = 20, userId } = params;
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  let keysetWhere = {};
  if (cursor) {
    const c = b64d(cursor) as { createdAt: string; idx: number };
    keysetWhere = {
      OR: [
        { createdAt: { lt: new Date(c.createdAt) } },
        {
          AND: [
            { createdAt: { equals: new Date(c.createdAt) } },
            { idx: { lt: c.idx } },
          ],
        },
      ],
    };
  }

  const where = {
    userId: targetUserId,
    isUse: true,
    isVisible: true,
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    ...keysetWhere,
  };

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { idx: 'desc' }],
    take: safeLimit + 1,
    include: {
      user: true,
      images: { orderBy: { createdAt: 'asc' } },
    },
  });

  const hasMore = posts.length > safeLimit;
  const items = hasMore ? posts.slice(0, safeLimit) : posts;

  const postIds = items.map((p) => p.idx);
  const [likes, bookmarks] = await Promise.all([
    prisma.blogPostLike.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    }),
    prisma.blogPostBookmark.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    }),
  ]);

  const likedPostIds = new Set(likes.map((l) => l.postId));
  const bookmarkedPostIds = new Set(bookmarks.map((b) => b.postId));

  let nextCursor: string | null = null;
  if (hasMore && items.length > 0) {
    const last = items[items.length - 1];
    nextCursor = b64e({
      createdAt: last.createdAt.toISOString(),
      idx: last.idx,
    });
  }

  return {
    items: items.map((post) =>
      toPostResponse(post, userId, likedPostIds, bookmarkedPostIds),
    ),
    nextCursor,
    hasMore,
  };
}

/**
 * 좋아요한 게시물 목록
 */
export async function getLikedPosts(
  params: GetPostsParams,
): Promise<ICursorPagination<IPostResponse>> {
  const { cursor, limit = 20, userId } = params;
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  let keysetWhere = {};
  if (cursor) {
    const c = b64d(cursor) as { createdAt: string; idx: number };
    keysetWhere = {
      OR: [
        { createdAt: { lt: new Date(c.createdAt) } },
        {
          AND: [
            { createdAt: { equals: new Date(c.createdAt) } },
            { idx: { lt: c.idx } },
          ],
        },
      ],
    };
  }

  // 먼저 좋아요한 게시물 ID 조회
  const likedPosts = await prisma.blogPostLike.findMany({
    where: { userId },
    select: { postId: true },
  });
  const likedPostIds = likedPosts.map((l) => l.postId);

  if (likedPostIds.length === 0) {
    return { items: [], nextCursor: null, hasMore: false };
  }

  const where = {
    idx: { in: likedPostIds },
    isUse: true,
    isVisible: true,
    ...keysetWhere,
  };

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { idx: 'desc' }],
    take: safeLimit + 1,
    include: {
      user: true,
      images: { orderBy: { createdAt: 'asc' } },
    },
  });

  const hasMore = posts.length > safeLimit;
  const items = hasMore ? posts.slice(0, safeLimit) : posts;

  // 북마크 상태 조회
  const postIds = items.map((p) => p.idx);
  const bookmarks = await prisma.blogPostBookmark.findMany({
    where: { userId, postId: { in: postIds } },
    select: { postId: true },
  });
  const bookmarkedPostIds = new Set(bookmarks.map((b) => b.postId));
  const likedSet = new Set(likedPostIds);

  let nextCursor: string | null = null;
  if (hasMore && items.length > 0) {
    const last = items[items.length - 1];
    nextCursor = b64e({
      createdAt: last.createdAt.toISOString(),
      idx: last.idx,
    });
  }

  return {
    items: items.map((post) =>
      toPostResponse(post, userId, likedSet, bookmarkedPostIds),
    ),
    nextCursor,
    hasMore,
  };
}

/**
 * 북마크한 게시물 목록
 */
export async function getBookmarkedPosts(
  params: GetPostsParams,
): Promise<ICursorPagination<IPostResponse>> {
  const { cursor, limit = 20, userId } = params;
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  let keysetWhere = {};
  if (cursor) {
    const c = b64d(cursor) as { createdAt: string; idx: number };
    keysetWhere = {
      OR: [
        { createdAt: { lt: new Date(c.createdAt) } },
        {
          AND: [
            { createdAt: { equals: new Date(c.createdAt) } },
            { idx: { lt: c.idx } },
          ],
        },
      ],
    };
  }

  // 먼저 북마크한 게시물 ID 조회
  const bookmarkedPosts = await prisma.blogPostBookmark.findMany({
    where: { userId },
    select: { postId: true },
  });
  const bookmarkedPostIds = bookmarkedPosts.map((b) => b.postId);

  if (bookmarkedPostIds.length === 0) {
    return { items: [], nextCursor: null, hasMore: false };
  }

  const where = {
    idx: { in: bookmarkedPostIds },
    isUse: true,
    isVisible: true,
    ...keysetWhere,
  };

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { idx: 'desc' }],
    take: safeLimit + 1,
    include: {
      user: true,
      images: { orderBy: { createdAt: 'asc' } },
    },
  });

  const hasMore = posts.length > safeLimit;
  const items = hasMore ? posts.slice(0, safeLimit) : posts;

  // 좋아요 상태 조회
  const postIds = items.map((p) => p.idx);
  const likes = await prisma.blogPostLike.findMany({
    where: { userId, postId: { in: postIds } },
    select: { postId: true },
  });
  const likedPostIds = new Set(likes.map((l) => l.postId));
  const bookmarkedSet = new Set(bookmarkedPostIds);

  let nextCursor: string | null = null;
  if (hasMore && items.length > 0) {
    const last = items[items.length - 1];
    nextCursor = b64e({
      createdAt: last.createdAt.toISOString(),
      idx: last.idx,
    });
  }

  return {
    items: items.map((post) =>
      toPostResponse(post, userId, likedPostIds, bookmarkedSet),
    ),
    nextCursor,
    hasMore,
  };
}

// ============================================
// 단건 조회
// ============================================

/**
 * 게시물 상세 조회
 */
export async function getPostByUid(
  uid: string,
  userId: string,
): Promise<IPostResponse | null> {
  const post = await prisma.blogPost.findUnique({
    where: { uid, isUse: true, isVisible: true },
    include: {
      user: true,
      images: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!post) return null;

  const [like, bookmark] = await Promise.all([
    prisma.blogPostLike.findUnique({
      where: { postId_userId: { postId: post.idx, userId } },
    }),
    prisma.blogPostBookmark.findUnique({
      where: { postId_userId: { postId: post.idx, userId } },
    }),
  ]);

  const likedPostIds = new Set(like ? [post.idx] : []);
  const bookmarkedPostIds = new Set(bookmark ? [post.idx] : []);

  return toPostResponse(post, userId, likedPostIds, bookmarkedPostIds);
}

// ============================================
// 생성 / 수정 / 삭제
// ============================================

/**
 * 게시물 생성
 */
export async function createPost(
  userId: string,
  data: IPostCreateRequest,
): Promise<IPostResponse> {
  const { content, imageUrls = [], visibility = 'PUBLIC' } = data;

  const uid = uuidv4();

  const result = await prisma.$transaction(async (tx) => {
    const post = await tx.blogPost.create({
      data: {
        uid,
        userId,
        content,
        status: 'PUBLISHED',
        visibility,
        isUse: true,
        isVisible: true,
      },
    });

    // sortOrder 설정
    await tx.blogPost.update({
      where: { idx: post.idx },
      data: { sortOrder: post.idx },
    });

    // 이미지 연결
    if (imageUrls.length > 0) {
      await tx.blogPostImage.createMany({
        data: imageUrls.map((url) => ({
          uid: uuidv4(),
          postId: uid,
          name: url.split('/').pop() || 'image',
          originalName: url.split('/').pop() || 'image',
          url,
          ext: url.split('.').pop() || null,
          type: null,
        })),
      });
    }

    return await tx.blogPost.findUnique({
      where: { uid },
      include: {
        user: true,
        images: { orderBy: { createdAt: 'asc' } },
      },
    });
  });

  if (!result) throw new Error('CREATE_FAILED');

  return toPostResponse(result, userId, new Set(), new Set());
}

/**
 * 게시물 수정
 */
export async function updatePost(
  uid: string,
  userId: string,
  data: IPostUpdateRequest,
): Promise<IPostResponse | null> {
  const post = await prisma.blogPost.findUnique({
    where: { uid },
    select: { idx: true, userId: true },
  });

  if (!post) return null;
  if (post.userId !== userId) {
    throw new Error('NOT_OWNER');
  }

  const updated = await prisma.blogPost.update({
    where: { uid },
    data: {
      ...(data.content !== undefined && { content: data.content }),
    },
    include: {
      user: true,
      images: { orderBy: { createdAt: 'asc' } },
    },
  });

  const [like, bookmark] = await Promise.all([
    prisma.blogPostLike.findUnique({
      where: { postId_userId: { postId: updated.idx, userId } },
    }),
    prisma.blogPostBookmark.findUnique({
      where: { postId_userId: { postId: updated.idx, userId } },
    }),
  ]);

  const likedPostIds = new Set(like ? [updated.idx] : []);
  const bookmarkedPostIds = new Set(bookmark ? [updated.idx] : []);

  return toPostResponse(updated, userId, likedPostIds, bookmarkedPostIds);
}

/**
 * 게시물 삭제 (soft delete)
 */
export async function deletePost(
  uid: string,
  userId: string,
): Promise<boolean> {
  const post = await prisma.blogPost.findUnique({
    where: { uid },
    select: { idx: true, userId: true },
  });

  if (!post) return false;
  if (post.userId !== userId) {
    throw new Error('NOT_OWNER');
  }

  await prisma.blogPost.update({
    where: { uid },
    data: { isUse: false, isVisible: false },
  });

  return true;
}

// ============================================
// 좋아요 / 북마크
// ============================================

interface ToggleResult {
  toggled: boolean; // true = 추가됨, false = 삭제됨
  count: number;
}

/**
 * 좋아요 토글
 */
export async function toggleLike(
  uid: string,
  userId: string,
): Promise<ToggleResult | null> {
  const post = await prisma.blogPost.findUnique({
    where: { uid, isUse: true },
    select: { idx: true, likeCount: true },
  });

  if (!post) return null;

  const existing = await prisma.blogPostLike.findUnique({
    where: { postId_userId: { postId: post.idx, userId } },
  });

  if (existing) {
    // 삭제
    await prisma.$transaction([
      prisma.blogPostLike.delete({
        where: { postId_userId: { postId: post.idx, userId } },
      }),
      prisma.blogPost.update({
        where: { idx: post.idx },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return { toggled: false, count: Math.max(0, post.likeCount - 1) };
  } else {
    // 추가
    await prisma.$transaction([
      prisma.blogPostLike.create({
        data: { postId: post.idx, userId },
      }),
      prisma.blogPost.update({
        where: { idx: post.idx },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    return { toggled: true, count: post.likeCount + 1 };
  }
}

/**
 * 북마크 토글
 */
export async function toggleBookmark(
  uid: string,
  userId: string,
): Promise<ToggleResult | null> {
  const post = await prisma.blogPost.findUnique({
    where: { uid, isUse: true },
    select: { idx: true },
  });

  if (!post) return null;

  const existing = await prisma.blogPostBookmark.findUnique({
    where: { postId_userId: { postId: post.idx, userId } },
  });

  if (existing) {
    // 삭제
    await prisma.blogPostBookmark.delete({
      where: { postId_userId: { postId: post.idx, userId } },
    });
    return { toggled: false, count: 0 }; // 북마크는 count 관리 안 함
  } else {
    // 추가
    await prisma.blogPostBookmark.create({
      data: { postId: post.idx, userId },
    });
    return { toggled: true, count: 0 };
  }
}
