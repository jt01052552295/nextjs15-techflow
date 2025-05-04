import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ckLocale } from '@/lib/cookie';
import { __ts } from '@/utils/get-dictionary';
import { deleteNaverToken } from '@/lib/oauth/naver';
import { deleteKakaoToken } from '@/lib/oauth/kakao';
import { deleteGoogleToken } from '@/lib/oauth/google';
import { deleteGithubToken } from '@/lib/oauth/github';
import { revokeFacebookConnection } from '@/lib/oauth/facebook';
import { getAuthSession } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const language = await ckLocale();
    const session = await getAuthSession();
    if (!session) {
      const accessTokenFail = await __ts(
        'common.oauth.error.accessTokenFail',
        {},
        language,
      );
      return NextResponse.json({ error: accessTokenFail }, { status: 401 });
    }

    const currentUser = session;
    const { provider } = await request.json();
    const providerName = await __ts(`common.oauth.provider.${provider}`);

    // Fetch connected accounts
    const connectedAccounts = await prisma.account.findMany({
      where: { userId: currentUser.id },
    });

    // Ensure at least one connected account remains
    if (connectedAccounts.length <= 1) {
      const minRequired = await __ts(
        'common.oauth.error.minimumAccountRequired',
        {},
        language,
      );
      return NextResponse.json({ error: minRequired }, { status: 400 });
    }

    // Find the account for the given provider
    const existingAccount = connectedAccounts.find(
      (account) => account.provider === provider,
    );

    if (!existingAccount) {
      const providerNotFound = await __ts(
        'common.oauth.error.providerNotFound',
        {},
        language,
      );
      return NextResponse.json({ error: providerNotFound }, { status: 404 });
    }

    // Disconnect logic for each provider
    if (provider === 'naver' && existingAccount.access_token) {
      const naverTokenResult = await deleteNaverToken(
        existingAccount.access_token,
      );
      if (!naverTokenResult.success) {
        console.error('네이버 토큰 삭제 실패:', naverTokenResult.message);
      }
    } else if (provider === 'kakao' && existingAccount.access_token) {
      const kakaoTokenResult = await deleteKakaoToken(
        existingAccount.access_token,
      );
      if (!kakaoTokenResult.success) {
        console.error('카카오 토큰 삭제 실패:', kakaoTokenResult.message);
      }
    } else if (provider === 'google' && existingAccount.access_token) {
      const googleTokenResult = await deleteGoogleToken(
        existingAccount.access_token,
      );
      if (!googleTokenResult.success) {
        console.error('구글 토큰 삭제 실패:', googleTokenResult.message);
      }
    } else if (provider === 'github' && existingAccount.access_token) {
      const githubTokenResult = await deleteGithubToken(
        existingAccount.access_token,
      );
      if (!githubTokenResult.success) {
        console.error('GitHub 토큰 삭제 실패:', githubTokenResult.message);
      }
    } else if (provider === 'facebook' && existingAccount.access_token) {
      const facebookTokenResult = await revokeFacebookConnection(
        existingAccount.access_token,
        existingAccount.providerAccountId,
      );
      if (!facebookTokenResult.success) {
        console.error('Facebook 토큰 삭제 실패:', facebookTokenResult.message);
      }
    }

    // Delete the account from the database
    await prisma.account.delete({
      where: { idx: existingAccount.idx },
    });

    const revokeToken = await __ts(
      'common.oauth.success.revokeToken',
      { provider: providerName },
      language,
    );

    return NextResponse.json({ message: revokeToken }, { status: 200 });
  } catch (error) {
    console.error('연결끊기 오류:', error);
    const language = await ckLocale();
    const revokeToken = await __ts(
      'common.oauth.error.revokeToken',
      {},
      language,
    );
    return NextResponse.json({ error: revokeToken }, { status: 500 });
  }
}
