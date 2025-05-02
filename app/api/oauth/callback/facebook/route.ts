import { NextRequest, NextResponse } from 'next/server';
import { getFacebookToken, getFacebookProfile } from '@/lib/oauth/facebook';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { sign } from 'jsonwebtoken';
import { getRouteUrl } from '@/utils/routes';
import { ckLocale } from '@/lib/cookie';
import { __ts } from '@/utils/get-dictionary';
import { createAuthSession } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const language = await ckLocale();
    const provider = await __ts('common.oauth.provider.facebook', {}, language);
    const cookieStore = cookies();
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

    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
        include: { accounts: true },
      });

      if (existingUserByEmail) {

        if (existingUserByEmail.isSignout) {
          const msg = await __ts('common.oauth.error.withdrawnAccount', {}, language);
          const errorUrl = getRouteUrl('auth.error', language);
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=403&msg=${encodeURIComponent(msg)}`);
        }

        if (!existingUserByEmail.isUse) {
          const msg = await __ts('common.oauth.error.disabledAccount', {}, language);
          const errorUrl = getRouteUrl('auth.error', language);
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=403&msg=${encodeURIComponent(msg)}`);
        }
    
        const existingAccounts = existingUserByEmail.accounts || [];
        const otherSocial = existingAccounts.find(acc => acc.provider !== 'facebook');
        if (otherSocial) {
          const otherProvider = await __ts(`common.oauth.provider.${otherSocial.provider}`, {}, language);
          const msg = await __ts('common.oauth.error.otherSocialAccount', { provider: otherProvider }, language);
          const errorUrl = getRouteUrl('auth.error', language);
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=409&msg=${encodeURIComponent(msg)}`);
        }
      }
    } 

    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: 'facebook',
        providerAccountId: id,
      },
      include: { user: true },
    });

    if (existingAccount) {
      const user = existingAccount.user;

      if (user.isSignout) {
        const msg = await __ts('common.oauth.error.withdrawnAccount', {}, language);
        const errorUrl = getRouteUrl('auth.error', language);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=403&msg=${encodeURIComponent(msg)}`);
      }

      if (!user.isUse) {
        const msg = await __ts('common.oauth.error.disabledAccount', {}, language);
        const errorUrl = getRouteUrl('auth.error', language);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=403&msg=${encodeURIComponent(msg)}`);
      }
    

      await prisma.account.update({
        where: { idx: existingAccount.idx },
        data: {
          access_token: tokenResponse.access_token,
          expires_at: expires_in,
          updatedAt: new Date(),
        },
      });

      cookieStore.delete('facebook_oauth_state');

      const expiresAt = await createAuthSession(user, { expiryDays: 30 });
      const redirectUrl = process.env.NEXT_PUBLIC_APP_URL + getRouteUrl('main.index', language);
      return NextResponse.redirect(redirectUrl);
    }

    const oauthData = {
      provider: 'facebook',
      providerAccountId: id,
      email: email || '',
      name: name || '',
      nickname: name || '',
      profileImage: picture?.data?.url || null,
      phone: '',
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

    const registerUrl = process.env.NEXT_PUBLIC_APP_URL + getRouteUrl('auth.social', language);
    return NextResponse.redirect(registerUrl);
  } catch (error) {
    console.error('Facebook 로그인 콜백 오류:', error);
    const language = await ckLocale();
    const provider = await __ts('common.oauth.provider.facebook', {}, language);
    const errorUrl = getRouteUrl('auth.error', language);
    const callbackError = await __ts('common.oauth.error.callbackError', { provider }, language);
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=500&msg=${encodeURIComponent(callbackError)}`;
    return NextResponse.redirect(redirectUrl);
  }
}
