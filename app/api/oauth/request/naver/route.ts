import { NextRequest, NextResponse } from 'next/server';
import { getNaverAuthUrl } from '@/lib/oauth/naver';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // CSRF 방지를 위한 상태값 생성
    const state = 'oauth_' + randomBytes(16).toString('hex');

    // 상태값을 쿠키에 저장
    const cookieStore = await cookies();
    cookieStore.set('naver_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5분
      path: '/',
    });

    // 네이버 로그인 URL 생성
    const authUrl = getNaverAuthUrl(state);

    // 네이버 로그인 페이지로 리다이렉트
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('네이버 로그인 요청 오류:', error);
    return NextResponse.json(
      { error: '네이버 로그인 요청 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
