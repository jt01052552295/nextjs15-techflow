import { NextRequest, NextResponse } from 'next/server';
import { getGithubAuthUrl } from '@/lib/oauth/github';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { ckLocale } from '@/lib/cookie';
import { __ts } from '@/utils/get-dictionary';

export async function GET(request: NextRequest) {
  const language = await ckLocale();
  try {
    const searchParams = request.nextUrl.searchParams;
    // mode 파라미터 추출 (login 또는 connect)
    const mode = searchParams.get('mode') || 'login';
    // CSRF 방지를 위한 상태값 생성
    const state = 'oauth_' + randomBytes(16).toString('hex');

    const stateData = JSON.stringify({ random: state, mode });
    const encodedState = Buffer.from(stateData).toString('base64');

    // 상태값을 쿠키에 저장
    const cookieStore = await cookies();
    cookieStore.set('github_oauth_state', encodedState, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5분
      path: '/',
    });

    // 로그인 URL 생성
    const authUrl = getGithubAuthUrl(encodedState);
    // 로그인 페이지로 리다이렉트
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const provider = await __ts('common.oauth.provider.github', {}, language);
    const callbackError = await __ts(
      'common.oauth.error.callbackError',
      { provider: provider },
      language,
    );
    console.error('github 로그인 요청 오류:', error);
    return NextResponse.json({ error: callbackError }, { status: 500 });
  }
}
