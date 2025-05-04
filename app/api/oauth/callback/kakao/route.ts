import { NextRequest, NextResponse } from 'next/server';
import { getKakaoToken, getKakaoProfile } from '@/lib/oauth/kakao';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sign } from 'jsonwebtoken';
import { getRouteUrl } from '@/utils/routes';
import { ckLocale } from '@/lib/cookie';
import { __ts } from '@/utils/get-dictionary';
import { createAuthSession, getAuthSession } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const language = await ckLocale();
    const provider = await __ts('common.oauth.provider.kakao', {}, language);

    const cookieStore = await cookies();
    const savedState = cookieStore.get('kakao_oauth_state')?.value;

    if (!code || !state || state !== savedState) {
      const invalidRequest = await __ts(
        'common.oauth.error.invalidRequest',
        { provider: provider },
        language,
      );
      const errorUrl = getRouteUrl('auth.error', language);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=400&msg=${invalidRequest}`;
      return NextResponse.redirect(redirectUrl);
      // return NextResponse.json(
      //   { error: '유효하지 않은 요청입니다.' },
      //   { status: 400 },
      // );
    }

    // state 디코딩하여 mode 정보 추출
    let mode = 'login';
    try {
      const decodedState = Buffer.from(state, 'base64').toString();
      const stateData = JSON.parse(decodedState);
      mode = stateData.mode || 'login';
    } catch (e) {
      console.error('Failed to parse state:', e);
    }
    console.log('mode', mode);

    // 액세스 토큰 요청
    const tokenResponse = await getKakaoToken(code);
    if (!tokenResponse.access_token) {
      const accessTokenFail = await __ts(
        'common.oauth.error.accessTokenFail',
        { provider: provider },
        language,
      );
      const errorUrl = getRouteUrl('auth.error', language);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=401&msg=${accessTokenFail}`;
      return NextResponse.redirect(redirectUrl);
    }

    // 프로필 정보 요청
    const profileResponse = await getKakaoProfile(tokenResponse.access_token);
    console.log(`profileResponse`, profileResponse);
    if (!profileResponse.id) {
      const userInfoFail = await __ts(
        'common.oauth.error.userInfoFail',
        { provider: provider },
        language,
      );
      const errorUrl = getRouteUrl('auth.error', language);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=402&msg=${userInfoFail}`;
      return NextResponse.redirect(redirectUrl);
    }

    const providerAccountId = String(profileResponse.id);

    const { email, name, profile_image, mobile } =
      profileResponse.kakao_account;
    const expires_in = Number(tokenResponse.expires_in);

    // 연결모드
    if (mode === 'connect') {
      const session = await getAuthSession();
      if (!session) {
        const accessTokenFail = await __ts(
          'common.oauth.error.accessTokenFail',
          {},
          language,
        );
        const errorUrl = getRouteUrl('error.index', language);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=401&msg=${encodeURIComponent(accessTokenFail)}`,
        );
      }

      const currentUser = session;

      // 이메일 주소 확인 (이메일이 같아야 계정 연결 가능)
      if (email !== currentUser.email) {
        const emailMismatch = await __ts(
          'common.oauth.error.emailMismatch',
          {},
          language,
        );
        const errorUrl = getRouteUrl('error.index', language);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=403&msg=${encodeURIComponent(emailMismatch)}`,
        );
      }

      // 이미 연결된 계정인지 확인
      const alreadyConnected = await prisma.account.findFirst({
        where: {
          provider: 'kakao',
          providerAccountId: providerAccountId,
        },
        include: { user: true },
      });

      if (alreadyConnected) {
        const alreadyConnectMsg = await __ts(
          'common.oauth.error.alreadyConnect',
          {},
          language,
        );
        const errorUrl = getRouteUrl('error.index', language);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=403&msg=${encodeURIComponent(alreadyConnectMsg)}`,
        );
      } else {
        // 새 계정 연결 생성
        await prisma.account.create({
          data: {
            provider: 'kakao',
            providerAccountId: providerAccountId,
            type: 'oauth',
            access_token: tokenResponse.access_token,
            refresh_token: tokenResponse.refresh_token || null,
            expires_at: expires_in ? parseInt(expires_in.toString(), 10) : null,
            userId: currentUser.id,
          },
        });

        const mySettingUrl = getRouteUrl('my.settings', language);
        const settingUrl = process.env.NEXT_PUBLIC_APP_URL + mySettingUrl;
        return NextResponse.redirect(`${settingUrl}`);
      }
    }

    // 소셜 계정으로 로그인
    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: 'kakao',
        providerAccountId,
      },
      include: {
        user: true,
      },
    });

    if (existingAccount) {
      const user = existingAccount.user;

      if (user.isSignout || !user.isUse) {
        const msgKey = user.isSignout
          ? 'common.oauth.error.withdrawnAccount'
          : 'common.oauth.error.disabledAccount';
        const msg = await __ts(msgKey, {}, language);
        const errorUrl = getRouteUrl('auth.error', language);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=403&msg=${encodeURIComponent(msg)}`,
        );
      }

      await prisma.account.update({
        where: { idx: existingAccount.idx },
        data: {
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token || null,
          expires_at: expires_in,
          token_type: tokenResponse.token_type || null,
          updatedAt: new Date(),
        },
      });

      cookieStore.delete('kakao_oauth_state');
      await createAuthSession(user, { expiryDays: 30 });

      const mainUrl = getRouteUrl('main.index', language);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}${mainUrl}`,
      );
    }

    // ❌ account는 없지만 동일 이메일 user가 존재 → 차단
    if (email) {
      const userByEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (userByEmail) {
        const msg = await __ts(
          'common.oauth.error.accountExists',
          {},
          language,
        );
        const errorUrl = getRouteUrl('auth.error', language);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=409&msg=${encodeURIComponent(msg)}`,
        );
      }
    }

    // 4. 신규 사용자인 경우 회원가입 페이지로 리다이렉트
    const oauthData = {
      provider: 'kakao',
      providerAccountId: providerAccountId,
      email: email,
      name: name || '',
      nickname: name || '',
      profileImage: profile_image || null,
      phone: mobile?.replace(/[^0-9]/g, '') || '09052552296',
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
    console.error('카카오 로그인 콜백 처리 오류:', error);
    const language = await ckLocale();
    const provider = await __ts('common.oauth.provider.kakao', {}, language);
    const errorUrl = getRouteUrl('auth.error', language);
    const callbackError = await __ts(
      'common.oauth.error.callbackError',
      { provider: provider },
      language,
    );
    const errorMessage = encodeURIComponent(callbackError);
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=500&msg=${errorMessage}`;
    return NextResponse.redirect(redirectUrl);
    // return NextResponse.json(
    //   { error: '네이버 로그인 처리 중 오류가 발생했습니다.' },
    //   { status: 500 },
    // );
  }
}
