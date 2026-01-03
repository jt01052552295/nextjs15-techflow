import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuthSession } from '@/lib/auth-utils';
import { hash } from 'bcryptjs';
import { API_CODE } from '@/constants/api-code';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, nick, phone } = body;

    if (!email || !password || !name || !nick) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    // 중복 체크
    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { nick }],
      },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.ALREADY_EXISTS },
        { status: 409 },
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await hash(password, 10);

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        nick,
        phone,
        role: 'USER',
        // 프로필 생성 (스키마에 따라 필드 조정 필요)
        profile: {
          create: {
            name: name,
            url: '', // 기본 이미지 없음
          },
        },
      },
    });

    // 세션 생성 및 토큰 발급
    const { token, expiresAt } = await createAuthSession(newUser);

    return NextResponse.json({
      success: true,
      code: API_CODE.SUCCESS.REGISTER,
      data: {
        token,
        expiresAt,
        user: { id: newUser.id, email: newUser.email, nick: newUser.nick },
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
