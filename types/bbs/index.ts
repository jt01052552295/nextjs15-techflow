import { IUser } from '@/types/user';
import { IBoard } from '@/types/board';
import { IBBSComment } from '@/types/comment';

export interface IBBS {
  idx: number;
  uid: string;
  cid: string;
  bdTable: string;
  userId?: string | null;
  name: string;
  password: string;
  notice: boolean;
  secret: boolean;
  category: string;
  subject: string;
  content?: string | null;
  contentA?: string | null;
  ipAddress?: string | null;
  hit: number;
  good: number;
  bad: number;
  comment: number;
  thread: string;
  commentCnt: number;
  threadCnt: number;
  link1: string;
  link2: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  isUse: boolean;
  isVisible: boolean;
  board: IBoard;
  user?: IUser;
  comments: IBBSComment[];
  files: IBBSFile[];
  likes: IBBSLike[];
  isMine?: boolean;
  isLiked?: boolean;
}

export type IBBSCounts = {
  comments: number;
  files: number;
  likes: number;
};

export type IBBSListRow = IBBS & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
  _count: IBBSCounts;
};

export interface IBBSLike {
  idx: number;
  parentIdx: number;
  userId: string;
  createdAt: Date;
  user?: IUser;
  bbs?: IBBS;
}

export interface IBBSFile {
  idx: number;
  uid: string;
  bdTable: string;
  pid: string;
  name: string;
  url: string;
  ext: string;
  originalName: string;
  size: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  board: IBoard;
  bbs: IBBS;
}

export type IBBSFileWithoutIDX = Omit<IBBSFile, 'idx'>;
export interface IBBSFileWithPreview extends IBBSFile {
  previewUrl?: string;
}
export type IBBSFilePart = Partial<IBBSFileWithPreview>;

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

export type ListResult<T = IBBSListRow> = {
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
