import { NextRequest, NextResponse } from 'next/server';
import { getNaverToken, getNaverProfile } from '@/lib/oauth/naver';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { sign } from 'jsonwebtoken';
import { getRouteUrl } from '@/utils/routes';
import { ckLocale } from '@/lib/cookie';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const language = await ckLocale();

    const cookieStore = await cookies();
    const savedState = cookieStore.get('naver_oauth_state')?.value;

    if (!code || !state || state !== savedState) {
      const errorUrl = getRouteUrl('auth.error', language);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=400&msg=유효하지 않은 요청입니다.`;
      return NextResponse.redirect(redirectUrl);
      // return NextResponse.json(
      //   { error: '유효하지 않은 요청입니다.' },
      //   { status: 400 },
      // );
    }

    // 네이버 액세스 토큰 요청
    const tokenResponse = await getNaverToken(code, state);
    if (!tokenResponse.access_token) {
      const errorUrl = getRouteUrl('auth.error', language);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=401&msg=액세스 토큰을 가져오는데 실패했습니다.`;
      return NextResponse.redirect(redirectUrl);
    }

    // 네이버 프로필 정보 요청
    const profileResponse = await getNaverProfile(tokenResponse.access_token);
    if (profileResponse.resultcode !== '00' || !profileResponse.response) {
      const errorUrl = getRouteUrl('auth.error', language);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=402&msg=사용자 정보를 가져오는데 실패했습니다.`;
      return NextResponse.redirect(redirectUrl);
    }

    const naverUser = profileResponse.response;
    // console.log(naverUser);

    // 새 사용자인 경우 추가 정보 입력 페이지로 리다이렉트
    // 네이버 사용자 정보를 암호화하여 쿠키에 저장

    const expires_in = Number(tokenResponse.expires_in);

    // 1. 소셜 계정으로 가입된 사용자 확인
    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: 'naver',
        providerAccountId: naverUser.id,
      },
      include: {
        user: true,
      },
    });

    // 2. 소셜 계정이 있으면 로그인 처리
    if (existingAccount) {
      const existingUser = existingAccount.user;
      console.log('기존 소셜 계정으로 가입된 사용자:', existingUser.email);

      // 계정 정보 업데이트 (토큰 갱신)
      await prisma.account.update({
        where: { idx: existingAccount.idx },
        data: {
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token || null,
          expires_at: expires_in ? parseInt(expires_in.toString(), 10) : null,
          token_type: tokenResponse.token_type || null,
          updatedAt: new Date(),
        },
      });

      // 세션 생성
      const sessionToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30일 후 만료

      await prisma.session.create({
        data: {
          sessionToken,
          userId: existingUser.id,
          expires: expiresAt,
        },
      });

      // JWT 토큰 생성
      const jwtSecret = process.env.JWT_SECRET || '';
      const token = sign(
        {
          userId: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        },
        jwtSecret,
        { expiresIn: '30d' },
      );

      // 쿠키에 세션 토큰 저장
      cookieStore.set('session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30일
        path: '/',
      });

      // 쿠키에 JWT 토큰 저장
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30일
        path: '/',
      });

      // 기존 OAuth 상태 쿠키 삭제
      cookieStore.delete('naver_oauth_state');

      // 메인 페이지로 리다이렉트
      const mainUrl = getRouteUrl('main.index', language);
      const redirectUrl = process.env.NEXT_PUBLIC_APP_URL + mainUrl;
      console.log(redirectUrl);
      return NextResponse.redirect(`${redirectUrl}`);
    }
    // 3. 이메일로 가입된 사용자 확인 (소셜 계정 연결이 안된 경우)
    else if (naverUser.email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: naverUser.email },
      });

      if (existingUserByEmail) {
        console.log(
          '이미 같은 이메일로 가입된 사용자:',
          existingUserByEmail.email,
        );

        const errorUrl = getRouteUrl('auth.error', language);
        const errorMessage = encodeURIComponent(
          '이미 같은 이메일로 가입된 계정이 있습니다. 해당 계정으로 로그인해주세요.',
        );
        const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=409&msg=${errorMessage}`;
        return NextResponse.redirect(redirectUrl);
      }
    }

    // 4. 신규 사용자인 경우 회원가입 페이지로 리다이렉트
    const oauthData = {
      provider: 'naver',
      providerAccountId: naverUser.id,
      email: naverUser.email,
      name: naverUser.name,
      nickname: naverUser.name,
      profileImage: naverUser.profile_image || null,
      phone: naverUser.mobile?.replace(/[^0-9]/g, '') || '09052552295',
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || null,
      expiresAt: tokenResponse.expires_in,
    };

    // OAuth 데이터를 암호화하여 쿠키에 저장
    const jwtSecret = process.env.JWT_SECRET || '';
    const oauthToken = sign(oauthData, jwtSecret, { expiresIn: '1h' });

    cookieStore.set('oauth_data', oauthToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenResponse.expires_in, // 3600
      path: '/',
    });

    // return NextResponse.json(
    //   {
    //     success: true,
    //     oauth: oauthData,
    //   },
    //   { status: 200 },
    // );

    const socialRegisterUrl = getRouteUrl('auth.social', language);
    // 추가 정보 입력 페이지로 리다이렉트
    const registerUrl = process.env.NEXT_PUBLIC_APP_URL + socialRegisterUrl;
    return NextResponse.redirect(`${registerUrl}`);

    // 로그인처리
    // const redirectUrl = process.env.NEXT_PUBLIC_APP_URL + mainUrl;
    // return NextResponse.redirect(`${redirectUrl}`);
  } catch (error) {
    console.error('네이버 로그인 콜백 처리 오류:', error);
    const language = await ckLocale();
    const errorUrl = getRouteUrl('auth.error', language);
    const errorMessage = encodeURIComponent(
      '네이버 로그인 처리 중 오류가 발생했습니다.',
    );
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=500&msg=${errorMessage}`;
    return NextResponse.redirect(redirectUrl);
    // return NextResponse.json(
    //   { error: '네이버 로그인 처리 중 오류가 발생했습니다.' },
    //   { status: 500 },
    // );
  }
}
