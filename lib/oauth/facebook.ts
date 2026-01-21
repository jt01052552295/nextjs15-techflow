// 페이스북 OAuth 설정 및 유틸리티 함수
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
export const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || '';
export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || '';
export const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || '';

export const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v24.0/dialog/oauth';
export const FACEBOOK_TOKEN_URL =
  'https://graph.facebook.com/v24.0/oauth/access_token';
export const FACEBOOK_PROFILE_URL = 'https://graph.facebook.com/me';
export const FACEBOOK_REVOKE_URL = (userId: string) =>
  `https://graph.facebook.com/${userId}/permissions`;

// 로그인 URL 생성
export function getFacebookAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: FACEBOOK_CLIENT_ID,
    redirect_uri: FACEBOOK_REDIRECT_URI,
    state,
    response_type: 'code',
    scope: 'email,public_profile',
  });

  return `${FACEBOOK_AUTH_URL}?${params.toString()}`;
}

// 액세스 토큰 요청
export async function getFacebookToken(code: string) {
  try {
    const params = new URLSearchParams({
      client_id: FACEBOOK_CLIENT_ID,
      client_secret: FACEBOOK_CLIENT_SECRET,
      redirect_uri: FACEBOOK_REDIRECT_URI,
      code,
    });

    const response = await fetch(`${FACEBOOK_TOKEN_URL}?${params.toString()}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Facebook token fetch error:', error);
    throw error;
  }
}

// 사용자 정보 조회
export async function getFacebookProfile(accessToken: string) {
  const url = `${FACEBOOK_PROFILE_URL}?fields=id,name,email&access_token=${accessToken}`;
  const response = await fetch(url);
  return await response.json();
}

// Facebook 연결 끊기 (토큰 폐기)
export async function revokeFacebookConnection(
  accessToken: string,
  userId: string,
) {
  const language = await ckLocale();
  try {
    const provider = await __ts('common.oauth.provider.facebook', {}, language);
    const response = await fetch(FACEBOOK_REVOKE_URL(userId), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = await __ts(
        'common.oauth.error.revokeTokenDetail',
        { provider: provider, desc: error.error?.message || 'Unknown error' },
        language,
      );

      throw new Error(errorMessage);
    }

    const successMessage = await __ts(
      'common.oauth.success.revokeToken',
      { provider: provider },
      language,
    );

    return { success: true, message: successMessage };
  } catch (error) {
    const provider = await __ts('common.oauth.provider.facebook', {}, language);
    const unknown = await __ts(
      'common.oauth.error.unknown',
      { provider: provider },
      language,
    );

    console.error('Failed to revoke facebook connection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : unknown,
      error,
    };
  }
}

// 타입
export interface FacebookUser {
  id: string;
  name: string;
  email?: string;
}

export interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
