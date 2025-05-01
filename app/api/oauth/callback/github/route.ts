import { NextRequest, NextResponse } from 'next/server';
import {
  getGithubToken,
  getGithubProfile,
  getGithubEmails,
} from '@/lib/oauth/github';
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
    const provider = await __ts('common.oauth.provider.github', {}, language);

    const cookieStore = await cookies();
    const savedState = cookieStore.get('github_oauth_state')?.value;

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

    // 액세스 토큰 요청
    const tokenResponse = await getGithubToken(code);
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
    const profileResponse = await getGithubProfile(tokenResponse.access_token);
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

    // 이메일이 null인 경우 별도로 이메일 정보 요청
    let userEmail = profileResponse.email;
    if (!userEmail) {
      try {
        const emailsResponse = await getGithubEmails(
          tokenResponse.access_token,
        );
        console.log('GitHub emails:', emailsResponse);

        // 주 이메일(primary) 또는 첫 번째 이메일 사용
        const primaryEmail = emailsResponse.find((email: any) => email.primary);
        if (primaryEmail && primaryEmail.verified) {
          userEmail = primaryEmail.email;
        } else if (emailsResponse.length > 0 && emailsResponse[0].verified) {
          userEmail = emailsResponse[0].email;
        }

        console.log('Selected email:', userEmail);
      } catch (emailError) {
        console.error('GitHub 이메일 정보 가져오기 실패:', emailError);
      }
    }

    const { id, name } = profileResponse;
    // console.log(kakaoUser);

    // 새 사용자인 경우 추가 정보 입력 페이지로 리다이렉트
    // 네이버 사용자 정보를 암호화하여 쿠키에 저장

    const expires_in = Number(tokenResponse.expires_in);

    // 1. 이메일로 가입된 사용자 확인 (일반 계정 또는 다른 소셜 계정)
    if (userEmail) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: userEmail },
        include: {
          accounts: true,
        },
      });

      if (existingUserByEmail) {
        console.log(
          '이미 같은 이메일로 가입된 사용자:',
          existingUserByEmail.email,
        );

        const existingAccounts = existingUserByEmail.accounts || [];
        const existingSocialAccount = existingAccounts.find(
          (account) => account.provider !== 'github',
        );

        if (existingSocialAccount) {
          // 다른 소셜 계정으로 가입된 경우
          const providerName = await __ts(
            `common.oauth.provider.${existingSocialAccount.provider}`,
            {},
            language,
          );

          const otherSocialAccountError = await __ts(
            'common.oauth.error.otherSocialAccount',
            { provider: providerName },
            language,
          );
          const errorMessage = encodeURIComponent(otherSocialAccountError);
          const errorUrl = getRouteUrl('auth.error', language);
          const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}${errorUrl}?code=409&msg=${errorMessage}`;
          return NextResponse.redirect(redirectUrl);
        }
      }
    }

    // 2. 소셜 계정으로 가입된 사용자 확인
    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: 'github',
        providerAccountId: id.toString(),
      },
      include: {
        user: true,
      },
    });

    // 3. 소셜 계정이 있으면 로그인 처리
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

      // 기존 OAuth 상태 쿠키 삭제
      cookieStore.delete('github_oauth_state');

      const expiresAt = await createAuthSession(existingUser, {
        expiryDays: 30,
      });
      console.log(expiresAt);

      // 메인 페이지로 리다이렉트
      const mainUrl = getRouteUrl('main.index', language);
      const redirectUrl = process.env.NEXT_PUBLIC_APP_URL + mainUrl;
      console.log(redirectUrl);
      return NextResponse.redirect(`${redirectUrl}`);
    }

    // 4. 신규 사용자인 경우 회원가입 페이지로 리다이렉트
    const oauthData = {
      provider: 'github',
      providerAccountId: id.toString(),
      email: userEmail,
      name: name || '',
      nickname: name || profileResponse.login || '',
      profileImage: profileResponse.avatar_url || null,
      phone: '09052552295',
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
    console.error('github 로그인 콜백 처리 오류:', error);
    const language = await ckLocale();
    const provider = await __ts('common.oauth.provider.github', {}, language);
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
