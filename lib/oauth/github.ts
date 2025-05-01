// 깃허브 OAuth 설정 및 유틸리티 함수
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

// 깃허브 API 설정
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
export const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || '';

// 깃허브 API 엔드포인트
export const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
export const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
export const GITHUB_PROFILE_URL = 'https://api.github.com/user';
export const GITHUB_USER_EMAILS_URL = 'https://api.github.com/user/emails';

// 깃허브 로그인 URL 생성
export function getGithubAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: 'read:user user:email',
    state: state,
  });

  return `${GITHUB_AUTH_URL}?${params.toString()}`;
}

// 깃허브 액세스 토큰 요청
export async function getGithubToken(code: string) {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    code: code,
    redirect_uri: GITHUB_REDIRECT_URI,
  });

  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  return await response.json();
}

// 깃허브 프로필 정보 가져오기
export async function getGithubProfile(accessToken: string) {
  const response = await fetch(GITHUB_PROFILE_URL, {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/json',
    },
  });

  return await response.json();
}

// 깃허브 이메일 정보 가져오기 (프로필에 이메일이 없을 경우)
export async function getGithubEmails(accessToken: string) {
  const response = await fetch(GITHUB_USER_EMAILS_URL, {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/json',
    },
  });

  return await response.json();
}

// 깃허브 연결 해제 (회원 탈퇴)
export async function deleteGithubToken(token: string) {
  const language = await ckLocale();
  try {
    console.log('GitHub 토큰 폐기 시도');

    // 토큰 폐기
    const tokenResponse = await fetch(
      'https://api.github.com/applications/' + GITHUB_CLIENT_ID + '/token',
      {
        method: 'DELETE',
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`).toString(
              'base64',
            ),
          Accept: 'application/json',
        },
        body: JSON.stringify({ access_token: token }),
      },
    );

    console.log(
      '토큰 폐기 응답:',
      tokenResponse.status,
      tokenResponse.statusText,
    );

    // 토큰 폐기가 성공했으면 계속 진행, 실패했으면 오류 처리
    if (!tokenResponse.ok) {
      let errorDetail = 'Token revocation failed';
      try {
        const errorData = await tokenResponse.json();
        errorDetail = errorData.message || errorDetail;
        console.error('토큰 폐기 오류 상세:', errorData);
      } catch (e) {
        console.error('토큰 폐기 응답 파싱 실패:', e);
      }

      const provider = await __ts('common.oauth.provider.github', {}, language);
      const errorMessage = await __ts(
        'common.oauth.error.revokeTokenDetail',
        { provider: provider, desc: errorDetail },
        language,
      );
      throw new Error(errorMessage);
    }

    const provider = await __ts('common.oauth.provider.github', {}, language);
    const successMessage = await __ts(
      'common.oauth.success.revokeToken',
      { provider: provider },
      language,
    );

    // 사용자에게 GitHub 설정에서 앱 권한을 직접 취소하도록 안내하는 메시지 추가
    const additionalInfo =
      (await __ts(
        'common.oauth.info.manualRevokeInstruction',
        { provider: provider },
        language,
      )) ||
      '추가적인 앱 권한 취소를 위해 GitHub 설정에서 앱 연결을 확인해 주세요.';

    return {
      success: true,
      message: successMessage,
      additionalInfo: additionalInfo,
    };
  } catch (error) {
    const provider = await __ts('common.oauth.provider.github', {}, language);
    const unknown = await __ts(
      'common.oauth.error.unknown',
      { provider: provider },
      language,
    );

    console.error('Failed to revoke Github connection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : unknown,
      error,
    };
  }
}

// 깃허브 앱 권한 취소 함수 추가
export async function revokeGithubAppAuthorization(accessToken: string) {
  const language = await ckLocale();
  try {
    // GitHub 앱 권한 취소 엔드포인트 호출
    const response = await fetch(
      'https://api.github.com/applications/' + GITHUB_CLIENT_ID + '/grant',
      {
        method: 'DELETE',
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(`${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`).toString(
              'base64',
            ),
          Accept: 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      },
    );

    console.log(
      'GitHub 앱 권한 취소 응답:',
      response.status,
      response.statusText,
    );

    const provider = await __ts('common.oauth.provider.github', {}, language);

    if (!response.ok) {
      const errorMessage = await __ts(
        'common.oauth.error.revokeTokenDetail',
        { provider: provider, desc: 'Failed to revoke app authorization' },
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
    const provider = await __ts('common.oauth.provider.github', {}, language);
    const unknown = await __ts(
      'common.oauth.error.unknown',
      { provider: provider },
      language,
    );

    console.error('Failed to revoke Github app authorization:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : unknown,
      error,
    };
  }
}

// 깃허브 사용자 정보 타입
export interface GithubUser {
  id: number; // 사용자 ID
  login: string; // 사용자 로그인명
  name?: string; // 사용자 이름
  avatar_url?: string; // 프로필 이미지 URL
  email?: string; // 이메일 (null일 수 있음)
  bio?: string; // 자기소개
  location?: string; // 위치
}

// 깃허브 이메일 정보 타입
export interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

// 깃허브 토큰 응답 타입
export interface GithubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
}

// 깃허브 프로필 응답 타입
export interface GithubProfileResponse extends GithubUser {
  error?: string;
  error_description?: string;
}
