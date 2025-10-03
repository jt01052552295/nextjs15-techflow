export interface IConfig {
  idx: number; // Primary key (autoincrement)
  uid: string; // Unique UUID
  cid: string; // CUID
  CNFname: string; // Config name
  CNFvalue?: string | null; // Config value (Korean)
  CNFvalue_en?: string | null; // Config value (English)
  CNFvalue_ja?: string | null; // Config value (Japanese)
  CNFvalue_zh?: string | null; // Config value (Chinese)
  sortOrder: number; // Order
}

export type IConfigPart = Partial<IConfig>;

export type ListEditCell =
  | 'CNFvalue'
  | 'CNFvalue_en'
  | 'CNFvalue_ja'
  | 'CNFvalue_zh';

export type SortBy = 'idx' | 'CNFname' | 'sortOrder';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  CNFname?: string;
  CNFvalue?: string;
  CNFvalue_en?: string;
  CNFvalue_ja?: string;
  CNFvalue_zh?: string;

  sortBy?: SortBy; // 기본: 'idx'
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

export type ListResult<T = IConfig> = {
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
