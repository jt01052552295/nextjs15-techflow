import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';
import { makeRandString } from '@/lib/util';
// import { sendVerificationEmail } from '@/lib/mail';

// POST /api/v1/auth/password/reset-request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    // 사용자 확인 (이메일 또는 전화번호)
    const whereConditions = [];
    if (email) whereConditions.push({ email });
    if (phone) whereConditions.push({ phone });

    const user = await prisma.user.findFirst({
      where: {
        OR: whereConditions,
        isUse: true,
        isSignout: false,
      },
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

    // 식별자 결정 (이메일 우선, 없으면 전화번호)
    const identifier = email || phone;
    const type = email ? 'email' : 'phone';

    // 기존 토큰 삭제
    await prisma.verification.deleteMany({
      where: { identifier, purpose: 'PASSWORD_RESET' },
    });

    // 새 토큰 저장
    await prisma.verification.create({
      data: {
        identifier,
        code: code,
        type,
        purpose: 'PASSWORD_RESET',
        expiresAt: expires,
      },
    });

    // 이메일인 경우 메일 발송
    if (email) {
      console.log(`[EMAIL] To: ${email}, Code: ${code} (Not implemented yet)`);
      // await sendVerificationEmail(email, code);
    }
    // 전화번호인 경우 문자 발송 로직 (추후 구현 필요)
    else if (phone) {
      console.log(`[SMS] To: ${phone}, Code: ${code} (Not implemented yet)`);
      // await sendVerificationSMS(phone, code);
    }

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
