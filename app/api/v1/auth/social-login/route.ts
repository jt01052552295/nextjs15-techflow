import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import { makeRandString } from '@/lib/util';
import { hash } from 'bcryptjs';
import { getKakaoProfile } from '@/lib/oauth/kakao';
import { getNaverProfile } from '@/lib/oauth/naver';
import { getFacebookProfile } from '@/lib/oauth/facebook';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '@/lib/oauth/google';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

interface SocialLoginRequest {
  provider: 'google' | 'kakao' | 'naver' | 'facebook';
  token: string;
}

export async function POST(request: Request) {
  try {
    const body: SocialLoginRequest = await request.json();
    const { provider, token } = body;

    if (!provider || !token) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    let snsId: string = '';
    let email: string = '';
    let name: string = '';
    let profileImage: string = '';

    // 1. 소셜 플랫폼별 토큰 검증 및 사용자 정보 추출
    try {
      switch (provider) {
        case 'kakao':
          const kakaoProfile = await getKakaoProfile(token);
          if (!kakaoProfile.id) throw new Error('Failed to get Kakao ID');
          snsId = String(kakaoProfile.id);
          email = kakaoProfile.kakao_account?.email || '';
          name = kakaoProfile.kakao_account?.profile?.nickname || 'Kakao User';
          profileImage =
            kakaoProfile.kakao_account?.profile?.profile_image_url || '';
          break;

        case 'naver':
          const naverProfile = await getNaverProfile(token);
          if (naverProfile.resultcode !== '00')
            throw new Error('Failed to get Naver Profile');
          const naverUser = naverProfile.response;
          snsId = naverUser.id;
          email = naverUser.email || '';
          name = naverUser.name || 'Naver User';
          profileImage = naverUser.profile_image || '';
          break;

        case 'facebook':
          const fbProfile = await getFacebookProfile(token);
          if (!fbProfile.id) throw new Error('Failed to get Facebook ID');
          snsId = fbProfile.id;
          email = fbProfile.email || '';
          name = fbProfile.name || 'Facebook User';
          profileImage = fbProfile.picture?.data?.url || '';
          break;

        case 'google':
          // Google은 idToken 검증
          const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (!payload) throw new Error('Invalid Google ID Token');
          snsId = payload.sub;
          email = payload.email || '';
          name = payload.name || 'Google User';
          profileImage = payload.picture || '';
          break;

        default:
          return NextResponse.json(
            { success: false, error: 'Unsupported provider' },
            { status: 400 },
          );
      }
    } catch (error) {
      console.error(`[SocialLogin] ${provider} verification failed:`, error);
      return NextResponse.json(
        { success: false, error: 'Token verification failed' },
        { status: 401 },
      );
    }

    // 2. DB 확인 및 로그인/회원가입 처리
    // Account 테이블에서 provider + snsId 로 검색
    const account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: snsId,
        },
      },
      include: {
        user: true,
      },
    });

    let user = account?.user ?? null;

    // 2-1. 연결된 계정이 없는 경우
    if (!account) {
      // 이메일로 기존 가입된 유저가 있는지 확인
      if (email) {
        user = await prisma.user.findUnique({
          where: { email },
        });
      }

      if (user) {
        // 기존 유저 존재 -> 계정 연결 (Account 생성)
        await prisma.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider,
            providerAccountId: snsId,
            access_token: provider !== 'google' ? token : undefined, // Google은 idToken이므로 저장 안함 (선택사항)
            id_token: provider === 'google' ? token : undefined,
          },
        });
      } else {
        // 신규 유저 -> 회원가입 + 계정 연결
        const randomSuffix = makeRandString(8, 'alphanumericLower');
        const username = `user_${randomSuffix}`; // 랜덤 유저네임
        const tempPassword = await hash(makeRandString(16), 10); // 랜덤 비밀번호

        user = await prisma.user.create({
          data: {
            username,
            email: email || null,
            password: tempPassword,
            name: name,
            nick: name, // 닉네임 중복 시 처리 필요할 수 있음
            role: 'USER',
            provider: provider,
            emailVerified: new Date(),
            accounts: {
              create: {
                type: 'oauth',
                provider,
                providerAccountId: snsId,
                access_token: provider !== 'google' ? token : undefined,
                id_token: provider === 'google' ? token : undefined,
              },
            },
            profile: {
              create: {
                name: name,
                url: profileImage,
              },
            },
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.SERVER_ERROR },
        { status: 500 },
      );
    }

    // 3. JWT 토큰 발급
    const { token: appToken } = await createAuthSession(user);

    return NextResponse.json({
      success: true,
      data: {
        token: appToken,
      },
    });
  } catch (error) {
    console.error('Social Login Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
