import { NextRequest, NextResponse } from 'next/server';
import { getKakaoAuthUrl } from '@/lib/oauth/kakao';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { ckLocale } from '@/lib/cookie';
import { __ts } from '@/utils/get-dictionary';

export async function GET(request: NextRequest) {
  const language = await ckLocale();
  try {
    // CSRF 방지를 위한 상태값 생성
    const state = 'oauth_' + randomBytes(16).toString('hex');

    // 상태값을 쿠키에 저장
    const cookieStore = await cookies();
    cookieStore.set('kakao_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5분
      path: '/',
    });

    // 로그인 URL 생성
    const authUrl = getKakaoAuthUrl(state);

    // 로그인 페이지로 리다이렉트
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const provider = await __ts('common.oauth.provider.kakao', {}, language);
    const callbackError = await __ts(
      'common.oauth.error.callbackError',
      { provider: provider },
      language,
    );
    console.error('카카오 로그인 요청 오류:', error);
    return NextResponse.json({ error: callbackError }, { status: 500 });
  }
}
