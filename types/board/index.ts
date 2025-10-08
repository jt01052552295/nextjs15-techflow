export interface IBoard {
  idx: number;
  uid: string;
  cid: string;
  bdTable: string;
  bdName: string;
  bdNameEn: string;
  bdNameJa: string;
  bdNameZh: string;
  bdSkin: string;
  bdListSize: number;
  bdFileCount: number;
  bdNewTime: number;
  bdSecret: boolean;
  bdPrivate: boolean;
  bdBusiness: boolean;
  bdUseCategory: boolean;
  bdCategoryList?: string | null;
  bdFixTitle: string;
  bdListLevel: number;
  bdReadLevel: number;
  bdWriteLevel: number;
  bdReplyLevel: number;
  bdCommentLevel: number;
  bdUploadLevel: number;
  bdDownloadLevel: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  isUse: boolean;
  isVisible: boolean;
}

export type IBoardCounts = {
  posts: number;
  comments: number;
  files: number;
};

export type IBoardListRow = Omit<IBoard, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  _count: IBoardCounts;
};

export type ListEditCell = 'bdName';

export type SortBy =
  | 'idx'
  | 'bdName'
  | 'bdTable'
  | 'createdAt'
  | 'updatedAt'
  | 'sortOrder';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  bdName?: string;
  bdTable?: string;
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

export type ListResult<T = IBoardListRow> = {
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
