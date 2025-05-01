// 구글 OAuth 설정 및 유틸리티 함수
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

// 구글 API 설정
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';

// 구글 API 엔드포인트
export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_PROFILE_URL =
  'https://www.googleapis.com/oauth2/v3/userinfo';
export const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

// 구글 로그인 URL 생성
export function getGoogleAuthUrl(state: string) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    scope:
      'openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    state: state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

// 구글 액세스 토큰 요청
export async function getGoogleToken(code: string) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    code: code,
    redirect_uri: GOOGLE_REDIRECT_URI,
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  return await response.json();
}

// 액세스 토큰 갱신
export async function refreshGoogleToken(refreshToken: string) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  return await response.json();
}

// 구글 프로필 정보 가져오기
export async function getGoogleProfile(accessToken: string) {
  const response = await fetch(GOOGLE_PROFILE_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await response.json();
}

// 구글 토큰 폐기 (로그아웃)
export async function logoutGoogle(token: string) {
  const params = new URLSearchParams({
    token: token,
  });

  const response = await fetch(GOOGLE_REVOKE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  return response.status === 200;
}

// 구글 연결 해제 (회원 탈퇴)
export async function deleteGoogleToken(token: string) {
  const language = await ckLocale();
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      token: token,
    });

    const url = GOOGLE_REVOKE_URL + '?token=' + token;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const provider = await __ts('common.oauth.provider.google', {}, language);

    if (!response.ok) {
      const result = await response.json();
      const errorMessage = await __ts(
        'common.oauth.error.revokeTokenDetail',
        { provider: provider, desc: result.error_description || result.error },
        language,
      );

      throw new Error(errorMessage);
    }

    const successMessage = await __ts(
      'common.oauth.success.revokeToken',
      { provider: provider },
      language,
    );

    return {
      success: true,
      message: successMessage,
    };
  } catch (error) {
    const provider = await __ts('common.oauth.provider.google', {}, language);
    const unknown = await __ts(
      'common.oauth.error.unknown',
      { provider: provider },
      language,
    );

    console.error('Failed to revoke Google connection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : unknown,
      error,
    };
  }
}

// 구글 사용자 정보 타입
export interface GoogleUser {
  sub: string; // 사용자 ID
  name?: string; // 사용자 이름
  given_name?: string; // 이름
  family_name?: string; // 성
  picture?: string; // 프로필 이미지 URL
  email?: string; // 이메일
  email_verified?: boolean; // 이메일 인증 여부
  locale?: string; // 언어 설정
}

// 구글 토큰 응답 타입
export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

// 구글 프로필 응답 타입
export interface GoogleProfileResponse {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
  error?: string;
  error_description?: string;
}
