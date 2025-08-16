import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { getUserById } from '@/actions/user/info';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { likeComment } from '@/services/comments.service';

// POST /api/practice/comments/[cid]/like
export async function POST(
  _req: NextRequest,
  { params }: { params: { cid: string } },
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

  const commentIdx = Number(params.cid);
  if (!Number.isInteger(commentIdx) || commentIdx <= 0) {
    return NextResponse.json(
      { status: 'error', message: 'INVALID_COMMENT_ID' },
      { status: 400 },
    );
  }

  try {
    const author = '704a301b-99fe-4c16-973e-0c5fcd586ff0';
    const rs = await likeComment({ commentIdx, userId: author });

    if (!rs.ok && rs.reason === 'NOT_FOUND') {
      return NextResponse.json(
        { status: 'error', message: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: 'success',
      liked: rs.liked,
      likeCount: rs.likeCount,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { status: 'error', message: 'SERVER_ERROR', error: e?.message },
      { status: 500 },
    );
  }
}
