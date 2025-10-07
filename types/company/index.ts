import { IUser } from '@/types/user';

export interface ICompany {
  idx: number;
  uid: string;
  cid: string;
  userId: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  custNo?: string | null; // 고객 번호
  bizNo?: string | null; // 사업자 등록 번호
  corpNo?: string | null; // 법인 번호
  isUse: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: IUser | null;
}

export type ListEditCell = 'name' | 'bizNo';

export type SortBy = 'idx' | 'userId';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  name?: string;
  bizNo?: string;
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

export type ListResult<T = ICompany> = {
  items: T[];
  nextCursor?: string;
  totalAll: number;
  totalFiltered: number;
};

export type DeleteInput = {
  uid?: string;
  uids?: string[];
  hard?: boolean; // 기본 false(소프트 삭제)
};

export type DeleteResult = {
  mode: 'single' | 'bulk';
  affected: number; // 업데이트(soft) or 삭제(hard)된 개수
};
