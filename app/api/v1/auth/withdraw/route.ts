import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { API_CODE } from '@/constants/api-code';
import { IApiResult } from '@/types_api/auth';

// DELETE /api/v1/auth/withdraw
export async function DELETE() {
  try {
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

    // 회원 탈퇴 처리 (Soft Delete)
    await prisma.user.update({
      where: { id: session.id },
      data: {
        isUse: false,
        isSignout: true,
      },
    });

    // 로그아웃 처리 (쿠키 삭제)
    const cookieStore = await cookies();

    const sessionToken = cookieStore.get('session_token')?.value;
    // 세션 토큰이 있으면 데이터베이스에서 세션 삭제
    if (sessionToken) {
      try {
        await prisma.session.delete({
          where: {
            sessionToken,
          },
        });
      } catch (error) {
        console.error('세션 삭제 오류:', error);
        // 세션이 이미 없어도 로그아웃은 계속 진행
      }
    }

    // 인증 관련 쿠키 모두 삭제
    cookieStore.delete('session_expires');
    cookieStore.delete('session_token');
    cookieStore.delete('auth_token');
    cookieStore.delete('naver_oauth_state');
    cookieStore.delete('oauth_data');

    return NextResponse.json<IApiResult<null>>({
      success: true,
      code: API_CODE.SUCCESS.WITHDRAW,
      message: '회원 탈퇴가 완료되었습니다.',
    });
  } catch (error) {
    console.error('Withdraw Error:', error);
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
