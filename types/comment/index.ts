import { IUserMini } from '@/types/user';
import { IBoard } from '@/types/board';
import { IBBS } from '@/types/bbs';

export interface IBBSComment {
  idx: number;
  uid: string;
  bdTable: string;
  pid: string;
  author?: string | null;
  password?: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isUse: boolean;
  isVisible: boolean;
  parentIdx?: number | null;
  likeCount: number;
  replyCount: number;
  isUser: boolean;
  board: IBoard;
  bbs: IBBS;
  parent?: IBBSComment | null;
  replies: IBBSComment[];
  likes: IBBSCommentLike[];
  user?: IUserMini | null;
  isMine?: boolean;
  isLiked?: boolean;
}

export type IBBSCommentCounts = {
  replies: number;
};

export type IBBSCommentPart = Partial<IBBSComment>;

export type IBBSCommentRow = Omit<
  IBBSComment,
  | 'createdAt'
  | 'updatedAt'
  | 'isVisible'
  | 'isUse'
  | 'likes'
  | 'board'
  | 'bbs'
  | 'replies'
> & {
  createdAt: string;
  updatedAt: string;
  _count: IBBSCommentCounts;
};

export interface IBBSCommentLike {
  idx: number;
  parentIdx: number;
  userId: string;
  createdAt: Date;
  user?: IUserMini;
  comment?: IBBSComment;
}

export type ListEditCell = 'bdTable';

export type SortBy = 'likeCount' | 'replyCount' | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  bdTable?: string;
  author?: string;
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

export type ListResult<T = IBBSCommentRow> = {
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
