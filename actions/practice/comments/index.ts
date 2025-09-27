'use server';

import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-utils';
import { getUserById } from '@/actions/user/info';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { ITodosCommentPart, ITodosCommentRow } from '@/types/todos';
import type { CommentListParams, CommentListResult } from '@/types/practice';
import { CommentSchema } from './schema';
import {
  listComments,
  createComment,
  updateComment,
  deleteCommentByUid,
  deleteManyCommentsByUids,
  likeComment,
} from '@/services/comments.service';
import { fmtDateD } from '@/lib/util';

export async function listAction(
  params: CommentListParams,
): Promise<CommentListResult<ITodosCommentRow>> {
  try {
    const rs = await listComments(params);
    return {
      ...rs,
      items: rs.items.map(toDTO),
    };
  } catch (err) {
    console.error('[listAction - comment] error:', err);
    throw err;
  }
}

function toDTO(row: any): ITodosCommentRow {
  return {
    ...row,
    createdAt: fmtDateD(row.createdAt),
    updatedAt: fmtDateD(row.updatedAt),
  };
}

export async function createAction(data: ITodosCommentPart) {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const session = await getAuthSession();
  if (!session) {
    const msg = await __ts('common.oauth.error.accessTokenFail', {}, language);
    return { status: 'error', message: msg };
  }

  const dbUser = await getUserById(session.id as string);
  if (!dbUser) {
    const msg = await __ts(
      'common.form.notExist',
      { column: session.id! },
      language,
    );
    return { status: 'error', message: msg };
  }

  const parsed = CommentSchema(dictionary.common.form).safeParse(data);
  if (!parsed.success) {
    console.error('Validation error:', parsed.error.format());
    const errorDetails = parsed.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    return {
      status: 'error',
      message: missingFields,
      errors: parsed.error.format(), // 클라이언트에 전체 에러 구조 제공
      errorDetails,
    };
  }

  const { todoId, content, parentIdx = null } = parsed.data;

  try {
    // 1) 작성(서비스 — 추가 조회 없음)
    const created = await createComment({
      todoId,
      author: session.id!,
      content,
      parentIdx,
    });

    // 2) 작성자 포함해서 재조회(액션 레이어에서 수행)
    const full = await prisma.todosComment.findUnique({
      where: { idx: created.idx },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profile: { select: { url: true }, take: 1 },
          },
        },
      },
    });

    const ok = await __ts('common.save_success', {}, language);
    return { status: 'success', message: ok, data: full };
  } catch (e: any) {
    console.error(e);
    const fail = await __ts('common.save_failed', {}, language);
    return { status: 'error', message: fail, error: e?.message };
  }
}

export async function updateAction(data: ITodosCommentPart) {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const session = await getAuthSession();
  if (!session) {
    const msg = await __ts('common.oauth.error.accessTokenFail', {}, language);
    return { status: 'error', message: msg };
  }

  const dbUser = await getUserById(session.id as string);
  if (!dbUser) {
    const msg = await __ts(
      'common.form.notExist',
      { column: session.id! },
      language,
    );
    return { status: 'error', message: msg };
  }

  const parsed = CommentSchema(dictionary.common.form).safeParse(data);
  if (!parsed.success) {
    return { status: 'error', message: missingFields };
  }

  const { uid, content, todoId } = parsed.data;
  if (!uid || !todoId || !content) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  try {
    const rs = await updateComment({
      uid,
      author: session.id!,
      content,
      content2: content,
    });

    if (!rs.updated) {
      // uid 없음 or 소유자 아님
      const msg = await __ts('common.form.notExist', { column: uid }, language);
      return { status: 'error', message: msg };
    }

    // 2) 작성자 포함해서 재조회(액션 레이어에서 수행)
    const updated = await prisma.todosComment.findUnique({
      where: { uid },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profile: { select: { url: true }, take: 1 },
          },
        },
      },
    });

    const ok = await __ts('common.save_success', {}, language);
    return { status: 'success', message: ok, data: updated };
  } catch (e: any) {
    console.error(e);
    const fail = await __ts('common.save_failed', {}, language);
    return { status: 'error', message: fail, error: e?.message };
  }
}

export async function deleteCommentAction(data: ITodosCommentPart) {
  const language = await ckLocale();
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const session = await getAuthSession();
  if (!session) {
    const msg = await __ts('common.oauth.error.accessTokenFail', {}, language);
    return { status: 'error', message: msg };
  }

  const user = await getUserById(session.id as string);
  if (!user) {
    const msg = await __ts(
      'common.form.notExist',
      { column: session.id! },
      language,
    );
    return { status: 'error', message: msg };
  }

  const { uid } = data;

  if (!uid) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  try {
    const rs = await deleteCommentByUid({
      commentUid: uid,
    });

    if ((rs as any).forbidden) {
      const msg = await __ts('common.form.noPermission', {}, language);
      return { status: 'error', message: msg };
    }
    if ((rs as any).notFound) {
      const msg = await __ts('common.form.notExist', { column: uid }, language);
      return { status: 'error', message: msg };
    }
    if ((rs as any).blockedDueToReplies) {
      const msg =
        (await __ts('comment.has_replies_cannot_delete', {}, language)) ||
        (await __ts('common.delete_failed', {}, language));
      return { status: 'error', message: msg };
    }

    const ok = await __ts('common.delete_success', {}, language);
    return { status: 'success', message: ok, data: rs };
  } catch (e: any) {
    console.error(e);
    const fail = await __ts('common.delete_failed', {}, language);
    return { status: 'error', message: fail, error: e?.message };
  }
}

export async function deleteManyCommentsAction(payload: any) {
  const language = await ckLocale();
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const session = await getAuthSession();
  if (!session) {
    const msg = await __ts('common.oauth.error.accessTokenFail', {}, language);
    return { status: 'error', message: msg };
  }

  const user = await getUserById(session.id as string);
  if (!user) {
    const msg = await __ts(
      'common.form.notExist',
      { column: session.id! },
      language,
    );
    return { status: 'error', message: msg };
  }

  const { uids } = payload;

  if (!uids) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  try {
    const rs = await deleteManyCommentsByUids({
      commentUids: uids,
    });

    if ((rs as any).forbidden) {
      const msg = await __ts('common.form.noPermission', {}, language);
      return { status: 'error', message: msg };
    }

    // 일부만 삭제되었을 수 있음(blocked / notFound 포함)
    const ok = await __ts('common.delete_success', {}, language);
    return {
      status: 'success',
      message: ok,
      data: rs, // { deleted, blocked: string[], notFound: string[], skipped: string[] }
    };
  } catch (e: any) {
    console.error(e);
    const fail = await __ts('common.delete_failed', {}, language);
    return { status: 'error', message: fail, error: e?.message };
  }
}

export async function likeAction(payload: any) {
  const language = await ckLocale();
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const session = await getAuthSession();
  if (!session) {
    const msg = await __ts('common.oauth.error.accessTokenFail', {}, language);
    return { status: 'error', message: msg };
  }

  // (선택) 존재 확인으로 친절 메시지 유지
  const dbUser = await getUserById(session.id as string);
  if (!dbUser) {
    const msg = await __ts(
      'common.form.notExist',
      { column: session.id! },
      language,
    );
    return { status: 'error', message: msg };
  }

  const { commentId } = payload;

  if (!commentId) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  try {
    const rs = await likeComment({
      commentIdx: commentId,
      userId: session.id!,
    });

    if (!rs.ok && rs.reason === 'NOT_FOUND') {
      const msg = await __ts(
        'common.form.notExist',
        { column: String(commentId) },
        language,
      );
      return { status: 'error', message: msg };
    }

    const likemsg = await __ts('common.like', {}, language);
    const unlikemsg = await __ts('common.unlike', {}, language);

    const message = rs.liked ? likemsg : unlikemsg;

    return {
      status: 'success',
      message,
      liked: rs.liked,
      likeCount: rs.likeCount,
    };
  } catch (e: any) {
    console.error(e);
    const fail = await __ts('common.save_failed', {}, language);
    return { status: 'error', message: fail, error: e?.message };
  }
}
