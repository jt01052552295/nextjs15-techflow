import { NextResponse } from 'next/server';
import { getAuthSession, createAuthSession } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';

export async function POST() {
  try {
    // 현재 세션 확인 (헤더 토큰 포함)
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.UNAUTHORIZED },
        { status: 401 },
      );
    }

    // 사용자 정보 다시 조회 (최신 상태 반영)
    const user = await prisma.user.findUnique({
      where: { id: session.id, isUse: true, isSignout: false },
    });
    if (!user)
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.USER_NOT_FOUND },
        { status: 401 },
      );

    // 토큰 재발급 (연장)
    const { token, expiresAt } = await createAuthSession(user);

    return NextResponse.json({
      success: true,
      code: API_CODE.SUCCESS.REFRESH,
      data: { token, expiresAt },
    });
  } catch (error) {
    console.error('Refresh Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
