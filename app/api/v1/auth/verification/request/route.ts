import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';
import { makeRandString } from '@/lib/util';
import { sendVerificationEmail } from '@/lib/mail';
import { IVerificationRequest } from '@/types_api/auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IVerificationRequest;
    const { email, phone, purpose = 'SIGNUP' } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    const identifier = (email || phone)!;
    const type = email ? 'email' : 'phone';

    // 이미 가입된 사용자인지 확인 (회원가입용 인증인 경우)
    if (purpose === 'SIGNUP') {
      const existingUser = await prisma.user.findFirst({
        where: { [type]: identifier, isUse: true, isSignout: false },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, code: API_CODE.ERROR.ALREADY_EXISTS },
          { status: 409 },
        );
      }
    }

    // 인증 코드 생성 (6자리 숫자)
    const code = makeRandString(6, 'numeric');
    // 유효기간 3분
    const expires = new Date(Date.now() + 1000 * 60 * 3);

    // 기존 인증 데이터 삭제
    await prisma.verification.deleteMany({
      where: { identifier, purpose },
    });

    // 새 인증 데이터 저장
    await prisma.verification.create({
      data: {
        identifier,
        code,
        type: type === 'email' ? 'EMAIL' : 'PHONE',
        purpose,
        expiresAt: expires,
      },
    });

    // 인증 번호 발송
    if (type === 'email') {
      const isSent = await sendVerificationEmail(identifier, code);

      if (!isSent) {
        return NextResponse.json(
          { success: false, code: API_CODE.ERROR.SERVER_ERROR },
          { status: 500 },
        );
      }
    } else {
      // TODO: SMS 발송 로직 추가 (현재는 DB 저장만 수행)
      // await sendVerificationSMS(identifier, code);
    }

    return NextResponse.json({
      success: true,
      code: API_CODE.SUCCESS.CONNECTION_OK,
    });
  } catch (error) {
    console.error('Verification request error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
