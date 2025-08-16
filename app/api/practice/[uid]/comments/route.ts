import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth-utils';
import { getUserById } from '@/actions/user/info';
import { z } from 'zod';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import {
  createComment,
  deleteManyCommentsByUids,
} from '@/services/comments.service';
import { CommentSchema } from '@/actions/practice/comments/schema';

// POST /api/practice/[uid]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: { uid: string } },
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

  const { author, content, parentIdx = null } = parsed.data;

  try {
    // 1) 작성
    const created = await createComment({
      todoId: params.uid,
      //   author: session.id!,
      author,
      content,
      parentIdx,
    });

    // 2) 작성자 포함 재조회
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

    return NextResponse.json(
      { status: 'success', data: full },
      { status: 201 },
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { status: 'error', message: 'SERVER_ERROR', error: e?.message },
      { status: 500 },
    );
  }
}

const BodySchema = z.object({
  uids: z.array(z.string().min(1)).min(1),
});

// DELETE /api/practice/comments
export async function DELETE(req: NextRequest) {
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
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: 'error', message: missingFields },
      { status: 400 },
    );
  }

  const { uids } = parsed.data;

  try {
    const rs = await deleteManyCommentsByUids({
      commentUids: uids,
    });

    if ((rs as any).forbidden) {
      return NextResponse.json(
        { status: 'error', message: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    // 일부가 차단(blocked)되거나 못 찾은(notFound) 경우 포함해 그대로 반환
    return NextResponse.json({ status: 'success', data: rs });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { status: 'error', message: 'SERVER_ERROR', error: e?.message },
      { status: 500 },
    );
  }
}
