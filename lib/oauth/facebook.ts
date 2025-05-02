// Facebook OAuth 설정
export const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || '';
export const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || '';
export const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || '';

export const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v19.0/dialog/oauth';
export const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token';
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
  const params = new URLSearchParams({
    client_id: FACEBOOK_CLIENT_ID,
    client_secret: FACEBOOK_CLIENT_SECRET,
    redirect_uri: FACEBOOK_REDIRECT_URI,
    code,
  });

  const response = await fetch(`${FACEBOOK_TOKEN_URL}?${params.toString()}`, {
    method: 'GET',
  });

  return await response.json();
}

// 사용자 정보 조회
export async function getFacebookProfile(accessToken: string) {
  const url = `${FACEBOOK_PROFILE_URL}?fields=id,name,email,picture&access_token=${accessToken}`;
  const response = await fetch(url);
  return await response.json();
}

// Facebook 연결 끊기 (토큰 폐기)
export async function revokeFacebookConnection(accessToken: string, userId: string) {
  const response = await fetch(FACEBOOK_REVOKE_URL(userId), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Facebook 연결 해제 실패: ${error.error?.message || 'Unknown error'}`);
  }

  return { success: true, message: '페이스북 연결이 해제되었습니다.' };
}

// 타입
export interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
