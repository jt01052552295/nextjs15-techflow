import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuthSession } from '@/lib/auth-utils';
import { hash } from 'bcryptjs';
import { API_CODE } from '@/constants/api-code';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, birthDate } = body;

    // 필수 필드 확인 및 누락된 필드 수집
    const missingFields: string[] = [];
    if (!name) missingFields.push('name');
    if (!password) missingFields.push('password');
    if (!birthDate) missingFields.push('birthDate');
    if (!email && !phone) {
      missingFields.push('email');
      missingFields.push('phone');
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          code: API_CODE.ERROR.MISSING_FIELDS,
          details: missingFields,
        },
        { status: 400 },
      );
    }

    // 중복 체크 조건 생성
    const whereConditions: any[] = [{ name }];
    if (email) whereConditions.push({ email });
    if (phone) whereConditions.push({ phone });

    // 중복 체크
    const exists = await prisma.user.findFirst({
      where: {
        OR: whereConditions,
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

    // 랜덤 username 생성 (user_ + 랜덤 문자열)
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const username = `user_${randomSuffix}`;

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        username,
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        name,
        nick: name,
        birthDate,
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
        user: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role,
        },
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
