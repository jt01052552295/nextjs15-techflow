import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify, sign } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { ckLocale } from '@/lib/cookie';
import { __ts } from '@/utils/get-dictionary';

export async function POST(request: NextRequest) {
  const language = await ckLocale();
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const authToken = cookieStore.get('auth_token')?.value;

    if (!sessionToken || !authToken) {
      const invalidRequest = await __ts(
        'common.auth.error.invalidRequest',
        {},
        language,
      );
      return NextResponse.json({ error: invalidRequest }, { status: 401 });
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
      const sessionNotFound = await __ts(
        'common.auth.error.sessionNotFound',
        {},
        language,
      );
      return NextResponse.json({ error: sessionNotFound }, { status: 404 });
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

    const sessionExtended = await __ts(
      'common.auth.session.extended',
      {},
      language,
    );

    return NextResponse.json({
      success: true,
      message: sessionExtended,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('세션 연장 오류:', error);
    const sessionExtendError = await __ts(
      'common.auth.error.sessionExtendError',
      {},
      language,
    );
    return NextResponse.json({ error: sessionExtendError }, { status: 500 });
  }
}
