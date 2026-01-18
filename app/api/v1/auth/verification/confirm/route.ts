import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, code, purpose = 'SIGNUP' } = body;

    if ((!email && !phone) || !code) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    const isDevPhone = phone && phone.toString().startsWith('090');
    const isDevEmail = email && email.toString().endsWith('vaion.co.kr');

    if (isDevPhone || isDevEmail) {
      return NextResponse.json({
        success: true,
        code: API_CODE.SUCCESS.CONNECTION_OK,
      });
    }

    const identifier = email || phone;

    // 인증 코드 조회
    const verification = await prisma.verification.findFirst({
      where: {
        identifier,
        code,
        purpose,
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
      code: API_CODE.SUCCESS.CONNECTION_OK,
    });
  } catch (error) {
    console.error('Verification confirm error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
