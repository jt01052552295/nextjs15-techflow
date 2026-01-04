import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';
import { makeRandString } from '@/lib/util';
import { sendVerificationEmail } from '@/lib/mail';

// POST /api/v1/auth/password/reset-request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { email, isUse: true, isSignout: false },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.USER_NOT_FOUND },
        { status: 404 },
      );
    }

    // 인증 코드 생성 (6자리 숫자)
    const code = makeRandString(6, 'numeric');
    const expires = new Date(Date.now() + 1000 * 60 * 10); // 10분 후 만료

    // 기존 토큰 삭제 (해당 이메일에 대한)
    await prisma.verification.deleteMany({
      where: { identifier: email, purpose: 'PASSWORD_RESET' },
    });

    // 새 토큰 저장
    await prisma.verification.create({
      data: {
        identifier: email,
        code: code,
        type: 'email',
        purpose: 'PASSWORD_RESET',
        expiresAt: expires,
      },
    });

    // 이메일 발송
    await sendVerificationEmail(email, code);

    return NextResponse.json({
      success: true,
      code: API_CODE.SUCCESS.RESET_PASSWORD_REQUEST,
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
