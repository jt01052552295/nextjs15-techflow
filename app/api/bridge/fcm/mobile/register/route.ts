import { NextResponse } from 'next/server';
import { registerMobileToken } from '@/services/fcm/token.service';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, device_info } = body;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token is required',
        },
        { status: 400 },
      );
    }

    // 세션에서 사용자 ID 추출 (NextAuth 사용 시)
    // 실제 구현은 프로젝트의 인증 방식에 따라 다를 수 있습니다
    // const session = await fetch(`${req.headers.get('origin')}/api/auth/me`, {
    //   headers: {
    //     cookie: `next-auth.session-token=${sessionCookie.value}`,
    //   },
    // })
    //   .then((res) => res.json())
    //   .catch(() => null);

    // if (!session || !session.user?.id) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: '로그인 정보가 없습니다.',
    //     },
    //     { status: 401 },
    //   );
    // }

    // 토큰 등록
    await registerMobileToken({
      userId: '81cf6d86-72da-45ad-8440-2ea76ded67bb',
      token,
      deviceInfo: device_info,
    });

    return NextResponse.json(
      {
        success: true,
        message: '토큰이 등록되었습니다.',
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );
  } catch (error) {
    console.error('Mobile token register error:', error);
    const message =
      error instanceof Error ? error.message : '토큰 등록에 실패했습니다.';

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}
