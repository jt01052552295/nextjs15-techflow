// 카카오 OAuth 설정 및 유틸리티 함수
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

// 카카오 API 설정
export const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || '';
export const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || '';
export const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI || '';
export const KAKAO_ADMIN_KEY = process.env.KAKAO_ADMIN_KEY || '';

// 카카오 API 엔드포인트
export const KAKAO_AUTH_URL = 'https://kauth.kakao.com/oauth/authorize';
export const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
export const KAKAO_PROFILE_URL = 'https://kapi.kakao.com/v2/user/me';
export const KAKAO_LOGOUT_URL = 'https://kapi.kakao.com/v1/user/logout';
export const KAKAO_UNLINK_URL = 'https://kapi.kakao.com/v1/user/unlink';

// 카카오 로그인 URL 생성
export function getKakaoAuthUrl(state: string) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: KAKAO_CLIENT_ID,
    redirect_uri: KAKAO_REDIRECT_URI,
    state: state,
    scope: 'openid,account_email',
  });

  return `${KAKAO_AUTH_URL}?${params.toString()}`;
}

// 카카오 액세스 토큰 요청
export async function getKakaoToken(code: string) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: KAKAO_CLIENT_ID,
    client_secret: KAKAO_CLIENT_SECRET,
    code: code,
    redirect_uri: KAKAO_REDIRECT_URI,
  });

  const response = await fetch(KAKAO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: params.toString(),
  });

  return await response.json();
}

// 액세스 토큰 갱신
export async function refreshKakaoToken(refreshToken: string) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: KAKAO_CLIENT_ID,
    client_secret: KAKAO_CLIENT_SECRET,
    refresh_token: refreshToken,
  });

  const response = await fetch(KAKAO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: params.toString(),
  });

  return await response.json();
}

// 카카오 프로필 정보 가져오기
export async function getKakaoProfile(accessToken: string) {
  const params = new URLSearchParams({
    client_secret: KAKAO_CLIENT_SECRET,
  });
  const response = await fetch(KAKAO_PROFILE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: params.toString(),
  });

  return await response.json();
}

// 카카오 로그아웃 (액세스 토큰 만료)
export async function logoutKakao(id: string) {
  const params = new URLSearchParams({
    target_id_type: 'user_id',
    target_id: id,
    client_secret: KAKAO_CLIENT_SECRET,
  });

  const response = await fetch(KAKAO_LOGOUT_URL, {
    method: 'POST',
    headers: {
      Authorization: `KakaoAK ${KAKAO_ADMIN_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: params.toString(),
  });

  return await response.json();
}

// 카카오 연결 해제 (회원 탈퇴)
export async function deleteKakaoToken(id: string) {
  const language = await ckLocale();
  try {
    const params = new URLSearchParams({
      target_id_type: 'user_id',
      target_id: id,
      client_secret: KAKAO_CLIENT_SECRET,
    });
    const response = await fetch(KAKAO_UNLINK_URL, {
      method: 'POST',
      headers: {
        Authorization: `KakaoAK ${KAKAO_ADMIN_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: params.toString(),
    });

    const result = await response.json();

    const provider = await __ts('common.oauth.provider.kakao', {}, language);

    if (result.error) {
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
      data: result,
    };
  } catch (error) {
    const provider = await __ts('common.oauth.provider.kakao', {}, language);
    const unknown = await __ts(
      'common.oauth.error.unknown',
      { provider: provider },
      language,
    );

    console.error('Failed to revoke Kakao connection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : unknown,
      error,
    };
  }
}

// 카카오 사용자 정보 타입
export interface KakaoUser {
  id: number;
  connected_at: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile_nickname_needs_agreement?: boolean;
    profile_image_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image?: boolean;
    };
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    email?: string;
    age_range_needs_agreement?: boolean;
    age_range?: string;
    birthday_needs_agreement?: boolean;
    birthday?: string;
    gender_needs_agreement?: boolean;
    gender?: string;
    phone_number_needs_agreement?: boolean;
    phone_number?: string;
  };
}

// 카카오 토큰 응답 타입
export interface KakaoTokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

// 카카오 프로필 응답 타입
export interface KakaoProfileResponse {
  id: number;
  connected_at: string;
  properties: {
    nickname: string;
    profile_image: string;
    thumbnail_image: string;
  };
  kakao_account: {
    profile_nickname_needs_agreement: boolean;
    profile_image_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url: string;
      profile_image_url: string;
      is_default_image: boolean;
    };
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    email?: string;
    age_range_needs_agreement?: boolean;
    age_range?: string;
    birthday_needs_agreement?: boolean;
    birthday?: string;
    gender_needs_agreement?: boolean;
    gender?: string;
    phone_number_needs_agreement?: boolean;
    phone_number?: string;
  };
  error?: string;
  error_description?: string;
}
