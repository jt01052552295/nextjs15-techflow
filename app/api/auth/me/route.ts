import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { ckLocale } from '@/lib/cookie';
import { __ts } from '@/utils/get-dictionary';

export async function GET(request: NextRequest) {
  const language = await ckLocale();
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
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
    };

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      const userNotFound = await __ts(
        'common.auth.error.userNotFound',
        {},
        language,
      );
      return NextResponse.json({ error: userNotFound }, { status: 404 });
    }

    const userWithProfiles = {
      id: user.id,
      email: user.email,
      name: user.name,
      nick: user.nick,
      phone: user.phone,
      isUse: user.isUse,
      isVisible: user.isVisible,
      isSignout: user.isSignout,
      role: user.role,
      createdAt: user.createdAt,
      profile: user.profile || [],
    };

    // 캐시 방지 헤더 추가
    return NextResponse.json({ user: userWithProfiles });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    const userInfoError = await __ts(
      'common.auth.error.userInfoError',
      {},
      language,
    );
    return NextResponse.json({ error: userInfoError }, { status: 500 });
  }
}
