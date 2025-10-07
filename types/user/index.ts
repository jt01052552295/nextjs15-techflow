import { UserRole } from '@prisma/client';

export interface IUser {
  idx: number;
  id: string;
  email: string;
  emailVerified?: Date | null;
  phone: string;
  password: string;
  name: string;
  nick: string;
  level: number;
  zipcode?: string | null;
  addr1?: string | null;
  addr2?: string | null;
  image?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  signUpVerified?: Date | null;
  isUse: boolean;
  isVisible: boolean;
  isSignout: boolean;
  profile?: IUserProfile[] | null;
  accounts?: IUserAccount[] | null;
}

export type ListEditCell = 'name' | 'nick';

export type IUserCounts = {
  accounts: number;
};

export type IUserListRow = IUser & {
  emailVerified?: string | null;
  signUpVerified?: string | null;
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
  _count: IUserCounts;
};

export type IUserPart = Partial<IUser>;

export interface IUserMini {
  name: string;
  email: string;
  profile?: {
    url: string;
  }[];
}

export interface IUserProfile {
  idx?: number;
  uid: string;
  userId: string;
  name: string;
  url: string;
  user?: IUser | null; // (선택적 관계)
}
export type IUserProfilePart = Partial<IUserProfile>;

export interface IUserAccount {
  idx: number;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export type IUserAccountPart = Partial<IUserAccount>;

export type SortBy = 'idx' | 'name' | 'email' | 'createdAt' | 'updatedAt';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  name?: string;
  email?: string;
  dateType?: 'createdAt' | 'updatedAt';
  startDate?: string;
  endDate?: string;

  isUse?: boolean;
  isVisible?: boolean;

  sortBy?: SortBy; // 기본: 'createdAt'
  order?: SortOrder; // 기본: 'desc'

  /** 커서 기반 페이지네이션 */
  limit?: number; // 기본 20 (1~100)
  /**
   * 커서 토큰(JSON을 base64url로 인코드한 문자열)
   * 구조: { sortValue: any; idx: number }
   * 예) sortBy='createdAt' → { sortValue: '2025-08-01T12:34:56.000Z', idx: 12345 }
   */
  cursor?: string | null;
};

export type ListResult<T = IUser> = {
  items: T[];
  nextCursor?: string;
  totalAll: number;
  totalFiltered: number;
};

export type DeleteInput = {
  id?: string;
  ids?: string[];
  hard?: boolean; // 기본 false(소프트 삭제)
};

export type DeleteResult = {
  mode: 'single' | 'bulk';
  affected: number; // 업데이트(soft) or 삭제(hard)된 개수
};

export type DeleteAccountInput = {
  userId: string;
  idx: number;
  provider: string;
};
