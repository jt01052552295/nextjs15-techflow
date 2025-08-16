import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-utils';
import { getUserById } from '@/actions/user/info';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { updateComment, deleteCommentByUid } from '@/services/comments.service';
import { CommentSchema } from '@/actions/practice/comments/schema';

// PATCH /api/practice/[uid]/comments/[cid]  (cid = comment uid)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { uid: string; cid: string } },
) {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  //   const session = await getAuthSession();
  //   if (!session) {
  //     const msg = await __ts('common.oauth.error.accessTokenFail', {}, language);
  //     return NextResponse.json(
  //       { status: 'error', message: msg },
  //       { status: 401 },
  //     );
  //   }

  //   const dbUser = await getUserById(session.id as string);
  //   if (!dbUser) {
  //     const msg = await __ts(
  //       'common.form.notExist',
  //       { column: session.id! },
  //       language,
  //     );
  //     return NextResponse.json(
  //       { status: 'error', message: msg },
  //       { status: 404 },
  //     );
  //   }

  const body = await req.json().catch(() => ({}));
  const parsed = CommentSchema(dictionary.common.form).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: 'error', message: missingFields },
      { status: 400 },
    );
  }

  const { author, uid, content } = parsed.data;

  try {
    // 1) 서비스 호출(소유자 조건 포함)
    const rs = await updateComment({
      uid: params.cid,
      //   author: session.id!,
      author,
      content,
      content2: content,
    });

    if (!rs.updated) {
      const msg = await __ts('common.form.notExist', { column: uid }, language);
      // uid 없음 or 소유자 아님
      return NextResponse.json(
        { status: 'error', message: msg },
        { status: 404 },
      );
    }

    // 2) 업데이트 후 상세 재조회(필요 시 작성자 포함)
    const updated = await prisma.todosComment.findUnique({
      where: { uid: params.cid },
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

    return NextResponse.json({ status: 'success', data: updated });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { status: 'error', message: 'SERVER_ERROR', error: e?.message },
      { status: 500 },
    );
  }
}

// DELETE /api/practice/[uid]/comments/[cid]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { uid: string; cid: string } },
) {
  const language = await ckLocale();

  //   const session = await getAuthSession();
  //   if (!session) {
  //     const msg = await __ts('common.oauth.error.accessTokenFail', {}, language);
  //     return NextResponse.json(
  //       { status: 'error', message: msg },
  //       { status: 401 },
  //     );
  //   }

  //   const dbUser = await getUserById(session.id as string);
  //   if (!dbUser) {
  //     const msg = await __ts(
  //       'common.form.notExist',
  //       { column: session.id! },
  //       language,
  //     );
  //     return NextResponse.json(
  //       { status: 'error', message: msg },
  //       { status: 404 },
  //     );
  //   }

  try {
    const rs = await deleteCommentByUid({
      commentUid: params.cid,
    });

    if ((rs as any).forbidden) {
      const msg = await __ts('common.form.noPermission', {}, language);
      return NextResponse.json(
        { status: 'error', message: msg },
        { status: 403 },
      );
    }

    if ((rs as any).notFound) {
      const msg = await __ts(
        'common.form.notExist',
        { column: params.cid },
        language,
      );
      return NextResponse.json(
        { status: 'error', message: msg },
        { status: 404 },
      );
    }

    if ((rs as any).blockedDueToReplies) {
      const msg =
        (await __ts('comment.has_replies_cannot_delete', {}, language)) ||
        (await __ts('common.delete_failed', {}, language));
      return NextResponse.json(
        { status: 'error', message: msg },
        { status: 409 }, // Conflict
      );
    }

    const ok = await __ts('common.delete_success', {}, language);
    return NextResponse.json({ status: 'success', message: ok, data: rs });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { status: 'error', message: 'SERVER_ERROR', error: e?.message },
      { status: 500 },
    );
  }
}
