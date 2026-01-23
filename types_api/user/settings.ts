/**
 * 앱(RN) 전용 API 타입 정의 (v1)
 * 경로: /types_api/v1/user/settings.ts
 */

/**
 * 공통 API 결과 인터페이스
 */
export interface IApiResult<T = any> {
  success: boolean;
  code: string; // API_CODE.SUCCESS.* 또는 ERROR.*
  message?: string; // 사용자 표시용 메시지 (옵션)
  data?: T;
  list?: T[];
}

/**
 * 1. 내 계정 정보 수정 (Request)
 * PATCH /api/v1/users/me
 */
export interface IUpdateAccountRequest {
  username?: string;
  phone?: string;
  email?: string;
  zipcode?: string;
  addr1?: string;
  addr2?: string;
  // 필요한 경우 추가 필드
}

/**
 * 2. 비밀번호 변경 (Request)
 * POST /api/v1/users/password/change
 */
export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * 3. 알림 설정 (Data & Request)
 * GET, PATCH /api/v1/users/settings/notifications
 */
export interface INotificationConfig {
  notiPushAll: boolean;
  notiPushMention: boolean;
  notiPushReply: boolean;
  notiPushLike: boolean;
  notiPushRetweet: boolean;
  notiPushFollow: boolean;
  notiPushDM: boolean;
  notiEmailAll: boolean;
}

// PATCH 요청 시 Partial 타입 사용 (선택적 전송 가능)
export type IUpdateNotificationRequest = Partial<INotificationConfig>;

/**
 * 4. 개인정보 및 보안 설정 (Data & Request)
 * GET, PATCH /api/v1/users/settings/privacy
 */
export interface IPrivacyConfig {
  isProtected: boolean;
  allowTagging: boolean;
  allowDM: boolean;
}

export type IUpdatePrivacyRequest = Partial<IPrivacyConfig>;

/**
 * 5. 차단 관리 (Data & Request)
 * GET, POST, DELETE /api/v1/users/blocks
 */

// 차단된 사용자 정보 (Response List Item)
export interface IBlockedUserItem {
  userId: string; // UUID
  username: string; // 아이디
  nickname: string; // 닉네임
  profileImage: string | null;
}

// 차단하기/해제하기 요청 (Request)
export interface IBlockUserRequest {
  targetUserId: string;
}
