import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';
import { hash } from 'bcryptjs';
import { IResetPasswordRequest } from '@/types_api/auth';

// POST /api/v1/auth/password/reset
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IResetPasswordRequest;
    const { email, phone, code, newPassword } = body;

    if ((!email && !phone) || !code || !newPassword) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    // 식별자 결정
    const identifier = email || phone;

    // 토큰 재검증 (보안을 위해 한 번 더 확인)
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: identifier,
        code: code,
        purpose: 'PASSWORD_RESET',
      },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.INVALID_CODE },
        { status: 400 },
      );
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.EXPIRED_CODE },
        { status: 400 },
      );
    }

    // 비밀번호 해싱 및 업데이트
    const hashedPassword = await hash(newPassword, 10);

    // 업데이트할 사용자 식별 (이메일 우선, 없으면 전화번호)
    const whereClause = email ? { email } : { phone };

    await prisma.user.update({
      where: whereClause,
      data: {
        password: hashedPassword,
      },
    });

    // 사용된 토큰 삭제
    await prisma.verification.deleteMany({
      where: { identifier: identifier, purpose: 'PASSWORD_RESET' },
    });

    return NextResponse.json({
      success: true,
      code: API_CODE.SUCCESS.RESET_PASSWORD,
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
