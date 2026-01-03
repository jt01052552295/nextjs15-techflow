import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';

// GET /api/v1/test
// RN 앱 연결 테스트용
export async function GET() {
  try {
    // 인증 세션 확인 (헤더 토큰 테스트)
    const session = await getAuthSession();

    return NextResponse.json({
      success: true,
      message: 'RN App <-> Backend Connection OK',
      timestamp: new Date().toISOString(),
      authStatus: session ? 'Authenticated' : 'Guest',
      user: session
        ? {
            id: session.id,
            email: session.email,
            nick: session.nick,
          }
        : null,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 },
    );
  }
}
