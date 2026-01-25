import { NextResponse } from 'next/server';
import { getAuthSession, createAuthSession } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';
import { IApiResult } from '@/types_api/auth';

export async function POST() {
  try {
    // 현재 세션 확인 (헤더 토큰 포함)
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    // 사용자 정보 다시 조회 (최신 상태 반영)
    const user = await prisma.user.findUnique({
      where: { id: session.id, isUse: true, isSignout: false },
    });
    if (!user)
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.USER_NOT_FOUND,
          message: '사용자를 찾을 수 없습니다.',
        },
        { status: 401 },
      );

    // 토큰 재발급 (연장)
    const { token, expiresAt } = await createAuthSession(user);

    return NextResponse.json<IApiResult<{ token: string; expiresAt: Date }>>({
      success: true,
      code: API_CODE.SUCCESS.REFRESH,
      data: { token, expiresAt },
    });
  } catch (error) {
    console.error('Refresh Error:', error);
    return NextResponse.json<IApiResult<null>>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
