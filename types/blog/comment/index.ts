import type { PostCommentStatus } from '@prisma/client';
import { IBlogPost } from '@/types/blog/post';
import { IUser } from '@/types/user';

export interface IBlogPostComment {
  idx: number;
  uid: string;
  cid: string;

  postId: number;

  // 회원 댓글이면 userId(User.id), 비회원이면 null + author 사용
  userId: string | null;
  author: string | null;

  content: string;
  status: PostCommentStatus;
  ipAddress: string | null;

  // 1차/2차 구조
  parentIdx: number | null;
  depth: number; // 1 = 댓글, 2 = 답글

  likeCount: number;
  replyCount: number;

  isUse: boolean;
  isVisible: boolean;

  createdAt: Date;
  updatedAt: Date;

  // 관계 (필요한 경우에만 include로 가져옴)
  post?: IBlogPost | null;
  user?: IUser | null;

  parent?: IBlogPostComment | null;
  replies?: IBlogPostComment[]; // 대댓글 목록

  likes?: any[]; // 좋아요 목록 (IBlogPostCommentLike 인터페이스가 있다면 교체)
}
export type IBlogPostCommentPart = Partial<IBlogPostComment>;

export type IBlogPostCommentCounts = {
  replies: number;
};

export type IBlogPostCommentListRow = IBlogPostComment & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
  _count: IBlogPostCommentCounts;
};

export type ListEditCell = 'name';

export type SortBy = 'idx' | 'createdAt' | 'updatedAt';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  content?: string;
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

export type ListResult<T = IBlogPostCommentListRow> = {
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
