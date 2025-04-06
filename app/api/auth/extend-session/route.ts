import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify, sign } from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const authToken = cookieStore.get('auth_token')?.value;

    if (!sessionToken || !authToken) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 },
      );
    }

    // JWT 토큰 검증
    const jwtSecret = process.env.JWT_SECRET || '';
    const decoded = verify(authToken, jwtSecret) as {
      userId: string;
      // email: string;
      // name: string;
      // role: string;
    };

    // 세션 찾기
    const session = await prisma.session.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 새로운 만료 시간 설정 (30일 연장)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // 세션 업데이트
    await prisma.session.update({
      where: { sessionToken },
      data: { expires: expiresAt },
    });

    // 새 JWT 토큰 생성
    const newToken = sign(
      {
        userId: decoded.userId,
        // email: decoded.email,
        // name: decoded.name,
        // role: decoded.role,
      },
      jwtSecret,
      { expiresIn: '30d' },
    );

    // 쿠키 업데이트
    cookieStore.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30일
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: '세션이 성공적으로 연장되었습니다.',
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('세션 연장 오류:', error);
    return NextResponse.json(
      { error: '세션 연장 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
