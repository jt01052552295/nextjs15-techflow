import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';

// POST /api/v1/auth/password/verify
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    // 토큰 조회
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: email,
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

    // 만료 확인
    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.EXPIRED_CODE },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      code: API_CODE.SUCCESS.RESET_PASSWORD_VERIFY,
    });
  } catch (error) {
    console.error('Password verify error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
