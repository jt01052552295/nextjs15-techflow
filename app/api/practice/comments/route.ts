import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { getUserById } from '@/actions/user/info';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { listComments } from '@/services/comments.service';

// ?parentIdx=123         ← 없으면 루트 목록, 있으면 해당 댓글의 답글 목록
// ?sortBy=createdAt      ← createdAt | likeCount | replyCount | idx (루트에서만 의미 있음)
// ?order=desc            ← asc | desc   (답글은 정책상 ASC 권장)
// ?limit=20
// ?cursor=BASE64({ sortValue, idx })  ← 본문 list와 동일 규격
// api/practice/comments?uid=xxx&page=1&size=20&orderBy=likeCount&order=desc
export async function GET(req: NextRequest) {
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

  const session = await getAuthSession().catch(() => null);
  const currentUserId = session?.id ?? null;

  const { searchParams } = new URL(req.url);
  const todoId = searchParams.get('uid');

  if (!todoId) {
    return NextResponse.json(
      { status: 'error', message: 'uid is required' },
      { status: 400 },
    );
  }

  const parentIdx = Number(searchParams.get('parentIdx')) || null;
  const sortBy =
    (searchParams.get('sortBy') as 'createdAt' | 'likeCount' | 'replyCount') ||
    'createdAt';
  const order =
    (searchParams.get('order') as 'asc' | 'desc') ||
    (parentIdx ? 'asc' : 'desc');
  const limit = Number(searchParams.get('limit')) || 20;
  const cursor = searchParams.get('cursor');

  try {
    const rs = await listComments({
      todoId,
      parentIdx,
      sortBy,
      order,
      limit,
      cursor,
      currentUserId,
    });
    return NextResponse.json({ status: 'success', ...rs }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { status: 'error', message: 'SERVER_ERROR', error: e?.message },
      { status: 500 },
    );
  }
}
