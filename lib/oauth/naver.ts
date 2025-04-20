// 네이버 OAuth 설정 및 유틸리티 함수

// 네이버 API 설정
export const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || '';
export const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || '';
export const NAVER_REDIRECT_URI = process.env.NAVER_REDIRECT_URI || '';

// 네이버 API 엔드포인트
export const NAVER_AUTH_URL = 'https://nid.naver.com/oauth2.0/authorize';
export const NAVER_TOKEN_URL = 'https://nid.naver.com/oauth2.0/token';
export const NAVER_PROFILE_URL = 'https://openapi.naver.com/v1/nid/me';

// 네이버 로그인 URL 생성
export function getNaverAuthUrl(state: string) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: NAVER_CLIENT_ID,
    redirect_uri: NAVER_REDIRECT_URI,
    state: state,
  });

  return `${NAVER_AUTH_URL}?${params.toString()}`;
}

// 네이버 액세스 토큰 요청
export async function getNaverToken(code: string, state: string) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: NAVER_CLIENT_ID,
    client_secret: NAVER_CLIENT_SECRET,
    code: code,
    state: state,
  });

  const response = await fetch(NAVER_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  return await response.json();
}

// 액세스 토큰 갱신
export async function refreshNaverToken(refreshToken: string) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: NAVER_CLIENT_ID,
    client_secret: NAVER_CLIENT_SECRET,
    refresh_token: refreshToken,
  });

  const response = await fetch(NAVER_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  return await response.json();
}

// 네이버 프로필 정보 가져오기
export async function getNaverProfile(accessToken: string) {
  const response = await fetch(NAVER_PROFILE_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await response.json();
}

// 액세스 토큰 삭제
export async function deleteNaverToken(accessToken: string) {
  try {
    const params = new URLSearchParams({
      grant_type: 'delete',
      client_id: NAVER_CLIENT_ID,
      client_secret: NAVER_CLIENT_SECRET,
      access_token: accessToken,
      service_provider: 'NAVER',
    });

    const response = await fetch(NAVER_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(
        `Naver revoke error: ${result.error_description || result.error}`,
      );
    }

    return {
      success: true,
      message: 'Successfully revoked Naver connection',
      data: result,
    };
  } catch (error) {
    console.error('Failed to revoke Naver connection:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred while revoking Naver connection',
      error,
    };
  }
}

// 네이버 사용자 정보 타입
export interface NaverUser {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  profile_image?: string;
  age?: string;
  gender?: string;
  birthday?: string;
  mobile?: string;
}
// 네이버 토큰 응답 타입
export interface NaverTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

// 네이버 프로필 응답 타입
export interface NaverProfileResponse {
  resultcode: string;
  message: string;
  response: NaverUser;
  error?: string;
  error_description?: string;
}
