import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuthSession } from '@/lib/auth-utils';
import { compare } from 'bcryptjs';
import { API_CODE } from '@/constants/api-code';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email, isUse: true, isSignout: false },
      include: {
        profile: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          success: false,
          code: API_CODE.ERROR.INVALID_CREDENTIALS,
        },
        { status: 401 },
      );
    }

    // 비밀번호 확인
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.INVALID_CREDENTIALS },
        { status: 401 },
      );
    }

    // 세션 생성 및 토큰 발급
    const { token, expiresAt } = await createAuthSession(user);

    return NextResponse.json({
      success: true,
      code: API_CODE.SUCCESS.LOGIN,
      data: {
        token,
        expiresAt,
        user: { id: user.id, email: user.email, nick: user.nick },
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
