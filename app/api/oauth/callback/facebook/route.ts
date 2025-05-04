import { NextRequest, NextResponse } from 'next/server';
import { getFacebookToken, getFacebookProfile } from '@/lib/oauth/facebook';
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
    const provider = await __ts('common.oauth.provider.facebook', {}, language);
    const cookieStore = await cookies();
    const savedState = cookieStore.get('facebook_oauth_state')?.value;

    if (!code || !state || state !== savedState) {
      const invalidRequest = await __ts(
        'common.oauth.error.invalidRequest',
        { provider },
        language,
      );
      const errorUrl = getRouteUrl('auth.error', language);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=400&msg=${invalidRequest}`;
      return NextResponse.redirect(redirectUrl);
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

    const tokenResponse = await getFacebookToken(code);
    if (!tokenResponse.access_token) {
      const accessTokenFail = await __ts(
        'common.oauth.error.accessTokenFail',
        { provider },
        language,
      );
      const errorUrl = getRouteUrl('auth.error', language);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=401&msg=${accessTokenFail}`;
      return NextResponse.redirect(redirectUrl);
    }

    const profile = await getFacebookProfile(tokenResponse.access_token);
    if (!profile.id || !profile.email) {
      const userInfoFail = await __ts(
        'common.oauth.error.userInfoFail',
        { provider },
        language,
      );
      const errorUrl = getRouteUrl('auth.error', language);
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=402&msg=${userInfoFail}`;
      return NextResponse.redirect(redirectUrl);
    }

    const { id, name, email, picture } = profile;
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
          provider: 'facebook',
          providerAccountId: id,
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
            provider: 'facebook',
            providerAccountId: id,
            type: 'oauth',
            access_token: tokenResponse.access_token,
            refresh_token: tokenResponse.refresh_token || null,
            expires_at: expires_in ? parseInt(expires_in.toString(), 10) : null,
            userId: currentUser.id,
          },
        });
      }
    }

    // 소셜 계정으로 로그인
    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: 'facebook',
        providerAccountId: id,
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

      cookieStore.delete('facebook_oauth_state');
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

    const oauthData = {
      provider: 'facebook',
      providerAccountId: id,
      email: email || '',
      name: name || '',
      nickname: name || '',
      profileImage: picture?.data?.url || null,
      phone: '09052552294',
      accessToken: tokenResponse.access_token,
      refreshToken: null,
      expiresAt: expires_in,
    };

    const jwtSecret = process.env.JWT_SECRET || '';
    const oauthToken = sign(oauthData, jwtSecret, { expiresIn: '1h' });

    cookieStore.set('oauth_data', oauthToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expires_in,
      path: '/',
    });

    const registerUrl =
      process.env.NEXT_PUBLIC_APP_URL + getRouteUrl('auth.social', language);
    return NextResponse.redirect(registerUrl);
  } catch (error) {
    console.error('Facebook 로그인 콜백 오류:', error);
    const language = await ckLocale();
    const provider = await __ts('common.oauth.provider.facebook', {}, language);
    const errorUrl = getRouteUrl('auth.error', language);
    const callbackError = await __ts(
      'common.oauth.error.callbackError',
      { provider },
      language,
    );
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=500&msg=${encodeURIComponent(callbackError)}`;
    return NextResponse.redirect(redirectUrl);
  }
}
