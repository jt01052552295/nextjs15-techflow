export interface IBadge {
  idx: number;
  uid: string;
  bmType: string;
  bmCategory: string;
  bmLevel: string;
  bmThreshold: number;
  bmName: string;
  img1: string | null;
  createdAt: Date;
  updatedAt: Date;
  isUse: boolean;
  isVisible: boolean;
}
export type IBadgePart = Partial<IBadge>;

export type IBadgeCounts = {
  UserBadge: number;
};

export type IBadgeListRow = IBadge & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
  _count: IBadgeCounts;
};

export type ListEditCell = 'bmType' | 'bmName';

export type SortBy =
  | 'idx'
  | 'bmType'
  | 'bmThreshold'
  | 'createdAt'
  | 'updatedAt';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  bmType?: string;
  bmName?: string;
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

export type ListResult<T = IBadge> = {
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
