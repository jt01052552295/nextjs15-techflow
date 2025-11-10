import { NextResponse } from 'next/server';
import { loginByToken } from '@/services/fcm/token.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fcmToken = searchParams.get('fcm_token');

    if (!fcmToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'FCM token is required',
        },
        { status: 400 },
      );
    }

    // 토큰으로 사용자 정보 조회
    const user = await loginByToken(fcmToken);

    // 세션 설정 (NextAuth 사용 시 세션 쿠키 설정)
    // 실제 구현은 프로젝트의 인증 방식에 따라 다를 수 있습니다
    const sessionData = {
      idx: user.idx,
      id: user.id,
      email: user.email,
      name: user.name,
      level: user.level,
      role: user.role,
      logged_datetime: new Date().toISOString(),
    };

    // // 리다이렉트 URL 생성
    // const redirectUrl = new URL('/ko', req.headers.get('origin') || '');
    // redirectUrl.searchParams.set('login_success', '1');

    // // 세션 쿠키와 함께 리다이렉트
    // const response = NextResponse.redirect(redirectUrl);

    // // 세션 정보를 쿠키에 저장 (실제 프로젝트에서는 적절한 세션 관리 방식 사용)
    // response.cookies.set('app-session', JSON.stringify(sessionData), {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: 60 * 60 * 24 * 7, // 7일
    //   path: '/',
    // });

    return NextResponse.json(
      {
        success: true,
        data: sessionData,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );
  } catch (error) {
    console.error('Mobile login error:', error);
    const message =
      error instanceof Error ? error.message : '자동 로그인에 실패했습니다.';

    // 에러 발생 시 로그인 페이지로 리다이렉트
    const loginUrl = new URL(
      '/ko/auth/signin',
      req.headers.get('origin') || '',
    );
    loginUrl.searchParams.set('error', encodeURIComponent(message));

    return NextResponse.redirect(loginUrl);
  }
}
