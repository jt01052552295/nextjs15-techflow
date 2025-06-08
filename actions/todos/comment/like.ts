// actions/todos/comment/like.ts
'use server';

import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-utils';
import { getUserById } from '@/actions/user/info';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

export const toggleCommentLikeAction = async (commentId: number) => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);

  const session = await getAuthSession();
  if (!session) {
    const accessTokenFail = await __ts(
      'common.oauth.error.accessTokenFail',
      {},
      language,
    );
    return { status: 'error', message: accessTokenFail };
  }

  const user = session;

  const existing = await prisma.todosCommentLike.findUnique({
    where: {
      commentId_userId: {
        commentId,
        userId: user.id,
      },
    },
  });

  let liked = false;
  let likeCount = 0;

  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.todosCommentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId: user.id,
          },
        },
      });
      await tx.todosComment.update({
        where: { idx: commentId },
        data: { likeCount: { decrement: 1 } },
      });
      liked = false;
    } else {
      await tx.todosCommentLike.create({
        data: {
          commentId,
          userId: user.id,
        },
      });
      await tx.todosComment.update({
        where: { idx: commentId },
        data: { likeCount: { increment: 1 } },
      });
      liked = true;
    }

    // 최신 좋아요 수 다시 조회
    const comment = await tx.todosComment.findUnique({
      where: { idx: commentId },
      select: { likeCount: true },
    });
    likeCount = comment?.likeCount ?? 0;
  });

  return {
    status: 'success',
    message: liked ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.',
    liked,
    likeCount,
  };
};
