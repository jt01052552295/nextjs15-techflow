import { NextResponse } from 'next/server';
import { revokeMobileToken } from '@/services/fcm/token.service';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token is required',
        },
        { status: 400 },
      );
    }

    // 토큰 삭제
    const result = await revokeMobileToken({
      userId: '81cf6d86-72da-45ad-8440-2ea76ded67bb',
      token,
    });

    return NextResponse.json(
      {
        success: true,
        removed: result.removed,
        message: '토큰이 삭제되었습니다.',
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );
  } catch (error) {
    console.error('Mobile token revoke error:', error);
    const message =
      error instanceof Error ? error.message : '토큰 삭제에 실패했습니다.';

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}
