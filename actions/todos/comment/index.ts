'use server';
// import { auth } from '@/auth'
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { CommentTodoSchema } from './schema';
import { cookies } from 'next/headers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { ITodosComment, ITodosCommentPart } from '@/types/todos';
import { v4 as uuidv4 } from 'uuid';
import { getAuthSession } from '@/lib/auth-utils';
import { getUserById } from '@/actions/user/info';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

interface CommentFilter {
  todoId: string;
  orderBy?: 'latest' | 'popular';
  page?: number;
  take?: number;
}

export const createCommentAction = async (data: ITodosCommentPart) => {
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

  const validatedFields = CommentTodoSchema(dictionary.common.form).safeParse(
    data,
  );
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const { todoId, content } = validatedFields.data;

  // const now = dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
  const now = dayjs(new Date().getTime()).toISOString();
  const unix = dayjs(new Date().getTime()).valueOf();

  let rs: any = undefined;
  try {
    // throw Error('throw test')
    rs = await prisma.$transaction(async (prisma) => {
      const createData: any = {
        data: {
          uid: uuidv4(),
          todoId,
          author: user.id,
          content,
          content2: content,
          createdAt: now,
        },
      };

      const todo = await prisma.todosComment.create(createData);
      return todo;
    });

    const save_success = await __ts('common.save_success', {}, language);
    return {
      status: 'success',
      message: save_success,
      data: rs,
    };
  } catch (error: any) {
    // console.error 는 터미널창 확인,
    // return error는 브라우저로 전달
    console.error(error);
    const save_failed = await __ts('common.save_failed', {}, language);
    return {
      status: 'error',
      error: error.message,
      message: save_failed,
    };
  }

  // revalidatePath(`/auth/login`)
  // 해당 /URL에 있던 캐시를 삭제하고 다시 생성해주는 함수인데 페이지를 다시 로드해주는 기능도 있음,
  // 새로고침이 아니라 차이점만 바꿔주는 새로고침
};

export const updateCommentAction = async (data: ITodosCommentPart) => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const validatedFields = CommentTodoSchema(dictionary.common.form).safeParse(
    data,
  );

  console.log(data);

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const { uid, content, todoId } = validatedFields.data;

  if (!uid || !todoId || !content) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const comment = await prisma.todosComment.findUnique({ where: { uid } });
  if (!comment) {
    const notExist = await __ts(
      'common.form.notExist',
      { column: uid },
      language,
    );
    return {
      status: 'error',
      message: notExist,
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

export const deleteCommentAction = async (data: ITodosCommentPart) => {
  const language = await ckLocale();
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const { uid } = data;

  if (!uid) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const todo = await prisma.todosComment.findUnique({
    where: { uid },
  });
  if (!todo) {
    const notExist = await __ts(
      'common.form.notExist',
      { column: uid },
      language,
    );
    return {
      status: 'error',
      message: notExist,
    };
  }

  let rs = null;
  try {
    // throw Error('throw test')

    rs = await prisma.$transaction(async (prisma) => {
      const del2 = await prisma.todosComment.delete({
        where: { uid: todo.uid },
      });
      return del2;
    });

    const delete_success = await __ts('common.delete_success', {}, language);
    return {
      status: 'success',
      message: delete_success,
      data: rs,
    };
  } catch (error: any) {
    // console.error 는 터미널창 확인,
    // return error는 브라우저로 전달
    console.error(error);
    const delete_failed = await __ts('common.delete_failed', {}, language);
    return {
      status: 'error',
      error: error.message,
      message: delete_failed,
    };
  }

  // revalidatePath(`/auth/login`)
  // 해당 /URL에 있던 캐시를 삭제하고 다시 생성해주는 함수인데 페이지를 다시 로드해주는 기능도 있음,
  // 새로고침이 아니라 차이점만 바꿔주는 새로고침
};

export const listCommentAction = async (filters: CommentFilter) => {
  try {
    const take = filters.take ?? 20;
    const page = filters.page ?? 1;
    const skip = (page - 1) * take;

    const where: Prisma.TodosCommentWhereInput = {
      todoId: filters.todoId,
      parentIdx: null, // 답글 제외 → 최상위 댓글만
    };

    let orderBy: Prisma.TodosCommentOrderByWithRelationInput[] = [
      { createdAt: 'desc' },
    ];

    if (filters.orderBy === 'popular') {
      orderBy = [
        { likeCount: 'desc' }, // ← 좋아요 수 기준
        { createdAt: 'desc' }, // 동점일 경우 최신순
      ];
    }

    const queryOptions = {
      where,
      take,
      skip,
      orderBy,
    };

    const [items, totalCount] = await Promise.all([
      prisma.todosComment.findMany(queryOptions),
      prisma.todosComment.count({ where }),
    ]);

    const user = await getAuthSession();
    let likedMap = new Set<number>();
    if (user) {
      const likes = await prisma.todosCommentLike.findMany({
        where: {
          userId: user.id,
          commentId: { in: items.map((c) => c.idx) },
        },
        select: { commentId: true },
      });
      likedMap = new Set(likes.map((like) => like.commentId));
    }

    const totalPages = Math.ceil(totalCount / take);

    console.log('[listCommentAction]', {
      page,
      take,
      skip,
      orderBy,
      totalCount,
    });

    const itemsWithLiked = items.map((c) => ({
      ...c,
      liked: likedMap.has(c.idx),
    }));

    return {
      items: itemsWithLiked,
      page,
      totalPages,
      hasMore: page < totalPages,
      totalCount,
    };
  } catch (error) {
    console.error('listCommentAction 오류:', error);
    return undefined;
  }
};
