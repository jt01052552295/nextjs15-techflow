/**
 * 앱(RN) 전용 Auth API DTO (v1)
 * 경로: /types_api/auth/index.ts
 */

import { IApiResult } from '../user/settings';

/**
 * 1. 로그인 (Request)
 * POST /api/v1/auth/login
 */
export interface ILoginRequest {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
}

/**
 * 2. 회원가입 (Request)
 * POST /api/v1/auth/register
 */
export interface IRegisterRequest {
  email?: string;
  phone?: string;
  password: string;
  name: string;
  username?: string; // 선택사항? (로직 보면 username 필드 언급이 없지만 DB unique이므로 필요할 수 있음. 하지만 register route에는 name만 필수였음. 수정 필요할 수도)
  birthDate?: string; // YYYY-MM-DD
  // 마케팅 동의 등 추가 필드
}

/**
 * 3. 소셜 로그인 (Request)
 * POST /api/v1/auth/social-login
 */
export interface ISocialLoginRequest {
  provider: 'google' | 'kakao' | 'naver' | 'facebook' | 'apple';
  token: string;
}

/**
 * 4. 인증 요청 (Request)
 * POST /api/v1/auth/verification/request
 */

export type VerificationPurposeType =
  | 'SIGNUP'
  | 'LOGIN'
  | 'FIND_ACCOUNT'
  | 'PASSWORD_RESET'
  | 'WITHDRAW'
  | 'OTHER';

export interface IVerificationRequest {
  email?: string;
  phone?: string;
  purpose: VerificationPurposeType;
}

/**
 * 5. 인증 확인 (Request)
 * POST /api/v1/auth/verification/confirm
 */
export interface IVerificationConfirmRequest {
  email?: string;
  phone?: string;
  code: string;
  purpose: VerificationPurposeType;
}

/**
 * 6. 비밀번호 재설정 (Request)
 * POST /api/v1/auth/password/reset
 * (비로그인 상태에서 분실 시)
 */
export interface IResetPasswordRequest {
  email?: string;
  phone?: string;
  code: string; // 인증 코드
  newPassword?: string;
}

/**
 * 7. 아이디 찾기 (Request)
 * POST /api/v1/auth/find-id
 */
export interface IFindIdRequest {
  email?: string;
  phone?: string;
}

export interface IFindIdResponse {
  username: string;
}

export type { IApiResult }; // Re-export for convenience
