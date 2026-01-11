import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { sign } from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

interface SessionOptions {
  expiryDays?: number; // 세션 만료 일수 (기본값: 30일)
  jwtSecret?: string; // JWT 시크릿 키 (기본값: 환경변수 또는 기본값)
}

/**
 * 사용자 인증 세션 및 토큰을 생성하고 쿠키에 저장하는 함수
 * @param user 인증된 사용자 정보
 * @param options 세션 옵션 (만료 일수 등)
 * @returns 세션 만료 시간
 */
export async function createAuthSession(
  user: User,
  options: SessionOptions = {},
): Promise<{ expiresAt: Date; token: string }> {
  // 기본값 설정
  const expiryDays = options.expiryDays || 30;
  const jwtSecret =
    options.jwtSecret || process.env.JWT_SECRET || 'your-jwt-secret';

  // 1. 세션 생성
  const sessionToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays); // 지정된 일수 후 만료

  // 쿠키 만료 시간 (초 단위)
  const maxAge = expiryDays * 24 * 60 * 60;

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires: expiresAt,
    },
  });

  // 2. JWT 토큰 생성
  const token = sign(
    {
      userId: user.id,
      // 필요에 따라 추가 정보를 포함할 수 있습니다
      // email: user.email,
      // name: user.name,
      // role: user.role,
    },
    jwtSecret,
    { expiresIn: `${expiryDays}d` },
  );

  // 3. 쿠키에 세션 토큰 저장
  const cookieStore = await cookies();
  cookieStore.set('session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAge,
    path: '/',
  });

  // 4. 쿠키에 JWT 토큰 저장
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAge,
    path: '/',
  });

  // 5. 만료 시간을 클라이언트 쿠키에도 저장 (클라이언트에서 접근 가능하도록)
  cookieStore.set('session_expires', expiresAt.toISOString(), {
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAge,
    path: '/',
  });

  return { expiresAt, token };
}

export async function getAuthSession(): Promise<any | null> {
  const cookieStore = await cookies();

  let authToken = cookieStore.get('auth_token')?.value;

  // 쿠키에 토큰이 없다면 헤더(Authorization: Bearer ...) 확인 (RN 앱 대응)
  if (!authToken) {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
    }
  }

  if (!authToken) {
    return null;
  }

  try {
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
      return null;
    }

    const userWithProfiles = {
      id: user.id,
      username: user.username,
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

    return userWithProfiles;
  } catch (error) {
    console.error('세션 검증 오류:', error);
    return null;
  }
}
