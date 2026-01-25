import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuthSession } from '@/lib/auth-utils';
import { compare } from 'bcryptjs';
import { API_CODE } from '@/constants/api-code';
import { IApiResult, ILoginRequest } from '@/types_api/auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ILoginRequest;
    const { email, phone, username, password } = body;

    // 이메일, 전화번호, 아이디 중 하나는 필수 + 비밀번호 필수
    if ((!email && !phone && !username) || !password) {
      const response: IApiResult = {
        success: false,
        code: API_CODE.ERROR.MISSING_FIELDS,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 검색 조건 생성
    const whereConditions = [];
    if (email) whereConditions.push({ email });
    if (phone) whereConditions.push({ phone });
    if (username) whereConditions.push({ username });

    // 사용자 조회 (OR 검색 + 사용 가능 여부 체크)
    const user = await prisma.user.findFirst({
      where: {
        OR: whereConditions,
        isUse: true,
        isSignout: false,
      },
      include: {
        profile: true,
      },
    });

    if (!user || !user.password) {
      const response: IApiResult = {
        success: false,
        code: API_CODE.ERROR.INVALID_CREDENTIALS,
      };
      return NextResponse.json(response, { status: 401 });
    }

    // 비밀번호 확인
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      const response: IApiResult = {
        success: false,
        code: API_CODE.ERROR.INVALID_CREDENTIALS,
      };
      return NextResponse.json(response, { status: 401 });
    }

    // 세션 생성 및 토큰 발급
    const { token, expiresAt } = await createAuthSession(user);

    const response: IApiResult = {
      success: true,
      code: API_CODE.SUCCESS.LOGIN,
      data: {
        token,
        expiresAt,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Login Error:', error);
    const response: IApiResult = {
      success: false,
      code: API_CODE.ERROR.SERVER_ERROR,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
