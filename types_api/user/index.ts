import type { IApiResult } from './settings';

/**
 * 프로필 정보 수정 요청
 * PATCH /api/v1/user/profile
 */
export interface IUserProfileUpdateRequest {
  name?: string; // 이름 (2-50자)
  bio?: string; // 자기소개 (최대 160자)
  location?: string; // 위치 (최대 30자)
  website?: string; // 웹사이트 URL (최대 100자)
}

/**
 * 프로필 정보 수정 응답 데이터
 */
export interface IUserProfileUpdateData {
  name: string;
  nick: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  profileImage: string | null;
  bannerImage: string | null;
}

/**
 * 이미지 타입
 */
export type UserImageType = 'profile' | 'banner';

/**
 * 이미지 업로드 응답 데이터
 * POST /api/v1/user/images
 */
export interface IUserImageUploadData {
  url: string;
  type: UserImageType;
}

/**
 * 이미지 삭제 요청
 * DELETE /api/v1/user/images
 */
export interface IUserImageDeleteRequest {
  type: UserImageType;
}

// Result 타입
export type IUserProfileUpdateResult = IApiResult<IUserProfileUpdateData>;
export type IUserImageUploadResult = IApiResult<IUserImageUploadData>;
export type IUserImageDeleteResult = IApiResult<null>;

// ===============================
// 이미지 검증 상수
// ===============================
export const USER_IMAGE_CONFIG = {
  profile: {
    maxSize: 2 * 1024 * 1024, // 2MB
    maxSizeLabel: '2MB',
    recommendedSize: '400x400',
    aspectRatio: '1:1',
  },
  banner: {
    maxSize: 5 * 1024 * 1024, // 5MB
    maxSizeLabel: '5MB',
    recommendedSize: '1500x500',
    aspectRatio: '3:1',
  },
} as const;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

// ===============================
// 프로필 필드 검증 상수
// ===============================
export const USER_PROFILE_VALIDATION = {
  name: { min: 2, max: 50 },
  bio: { max: 160 },
  location: { max: 30 },
  website: { max: 100 },
} as const;
