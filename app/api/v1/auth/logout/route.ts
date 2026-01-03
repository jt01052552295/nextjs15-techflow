import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { API_CODE } from '@/constants/api-code';

// DELETE /api/v1/auth/withdraw
export async function DELETE() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.UNAUTHORIZED },
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
    cookieStore.delete('auth_token');
    cookieStore.delete('session_token');

    return NextResponse.json({
      success: true,
      code: API_CODE.SUCCESS.WITHDRAW,
    });
  } catch (error) {
    console.error('Withdraw Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
