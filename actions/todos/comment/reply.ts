'use server';

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { CommentTodoSchema } from './schema';
import { ckLocale } from '@/lib/cookie';
import { getDictionary, __ts } from '@/utils/get-dictionary';
import { getAuthSession } from '@/lib/auth-utils';
import { getUserById } from '@/actions/user/info';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { ITodosComment, ITodosCommentPart } from '@/types/todos';

interface CommentFilter {
  todoId: string;
  parentIdx?: number;
  orderBy?: 'latest' | 'popular';
  page?: number;
  take?: number;
}

export const createReplyAction = async (data: ITodosCommentPart) => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

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

  const dbUser = await getUserById(user.id as string);
  if (!dbUser) {
    const notExist = await __ts(
      'common.form.notExist',
      { column: user.id! },
      language,
    );
    return {
      status: 'error',
      message: notExist,
    };
  }

  const { todoId, content, parentIdx } = data;

  if (!todoId || !content || !parentIdx) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const now = dayjs().toISOString();

  try {
    const parent = await prisma.todosComment.findUnique({
      where: { idx: parentIdx },
    });
    if (!parent) {
      const notExist = await __ts(
        'common.form.notExist',
        { column: 'parentIdx' },
        language,
      );
      return { status: 'error', message: notExist };
    }

    const reply = await prisma.$transaction(async (tx) => {
      const created = await tx.todosComment.create({
        data: {
          uid: uuidv4(),
          todoId,
          parentIdx,
          author: user.id,
          content,
          content2: content,
          createdAt: now,
        },
      });

      const fullTodo = await tx.todosComment.findUnique({
        where: { idx: created.idx },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              profile: {
                select: {
                  url: true,
                },
                take: 1,
              },
            },
          },
        },
      });

      await tx.todosComment.update({
        where: { idx: parentIdx },
        data: { replyCount: { increment: 1 } },
      });

      return fullTodo;
    });

    const save_success = await __ts('common.save_success', {}, language);
    return {
      status: 'success',
      message: save_success,
      data: reply,
    };
  } catch (error: any) {
    console.error(error);
    const save_failed = await __ts('common.save_failed', {}, language);
    return {
      status: 'error',
      error: error.message,
      message: save_failed,
    };
  }
};

export const updateReplyAction = async (data: ITodosCommentPart) => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const { uid, content } = data;
  if (!uid || !content) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  try {
    const updated = await prisma.todosComment.update({
      where: { uid },
      data: { content },
    });
    const save_success = await __ts('common.save_success', {}, language);
    return {
      status: 'success',
      message: save_success,
      data: updated,
    };
  } catch (error: any) {
    console.error(error);
    const save_failed = await __ts('common.save_failed', {}, language);
    return {
      status: 'error',
      error: error.message,
      message: save_failed,
    };
  }
};

export const deleteReplyAction = async (data: ITodosCommentPart) => {
  const language = await ckLocale();
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const { uid, parentIdx } = data;
  if (!uid || !parentIdx) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const removed = await tx.todosComment.delete({ where: { uid } });
      await tx.todosComment.update({
        where: { idx: parentIdx },
        data: { replyCount: { decrement: 1 } },
      });
      return removed;
    });

    const delete_success = await __ts('common.delete_success', {}, language);
    return {
      status: 'success',
      message: delete_success,
      data: deleted,
    };
  } catch (error: any) {
    console.error(error);
    const delete_failed = await __ts('common.delete_failed', {}, language);
    return {
      status: 'error',
      error: error.message,
      message: delete_failed,
    };
  }
};

export const listReplyAction = async (filters: CommentFilter) => {
  try {
    const take = filters.take ?? 10;
    const page = filters.page ?? 1;
    const skip = (page - 1) * take;

    const { todoId, parentIdx } = filters;
    if (!todoId || !parentIdx) return undefined;

    const where: Prisma.TodosCommentWhereInput = {
      todoId,
      parentIdx,
    };

    const queryOptions = {
      where: { todoId: filters.todoId, parentIdx: filters.parentIdx },
      take,
      skip,
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profile: {
              select: {
                url: true,
              },
              take: 1,
            },
          },
        },
      },
    } satisfies Prisma.TodosCommentFindManyArgs;

    const [items, totalCount] = await Promise.all([
      prisma.todosComment.findMany(queryOptions),
      prisma.todosComment.count({ where: queryOptions.where }),
    ]);

    const user = await getAuthSession();
    let likedMap = new Set<number>();
    if (user) {
      const likes = await prisma.todosCommentLike.findMany({
        where: {
          userId: user.id,
          commentId: { in: items.map((r) => r.idx) },
        },
        select: { commentId: true },
      });
      likedMap = new Set(likes.map((like) => like.commentId));
    }

    const itemsWithLiked = items.map((r) => ({
      ...r,
      liked: likedMap.has(r.idx),
    }));

    const totalPages = Math.ceil(totalCount / take);

    return {
      items: itemsWithLiked,
      page,
      totalPages,
      hasMore: page < totalPages,
      totalCount,
    };
  } catch (error) {
    console.error('listReplyAction 오류:', error);
    return undefined;
  }
};
