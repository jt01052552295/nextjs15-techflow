import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';
import { IVerificationConfirmRequest, IApiResult } from '@/types_api/auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IVerificationConfirmRequest;
    const { email, phone, code, purpose = 'SIGNUP' } = body;

    if ((!email && !phone) || !code) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.MISSING_FIELDS,
          message: '이메일(또는 전화번호)과 인증 코드가 필요합니다.',
        },
        { status: 400 },
      );
    }

    const isDevPhone = phone && phone.toString().startsWith('090');
    const isDevEmail = email && email.toString().endsWith('vaion.co.kr');

    // 개발용 백도어
    if (isDevPhone || isDevEmail) {
      return NextResponse.json<IApiResult<null>>({
        success: true,
        code: API_CODE.SUCCESS.CONNECTION_OK,
        message: '개발용 인증이 통과되었습니다.',
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
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.INVALID_CODE,
          message: '유효하지 않은 인증 코드입니다.',
        },
        { status: 400 },
      );
    }

    // 만료 확인
    if (new Date() > verification.expiresAt) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.EXPIRED_CODE,
          message: '인증 코드가 만료되었습니다.',
        },
        { status: 400 },
      );
    }

    return NextResponse.json<IApiResult<null>>({
      success: true,
      code: API_CODE.SUCCESS.CONNECTION_OK,
      message: '인증이 성공했습니다.',
    });
  } catch (error) {
    console.error('Verification confirm error:', error);
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
