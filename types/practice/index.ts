import type { ITodosPart, ITodosCommentPart } from '@/types/todos';

export type SortBy =
  | 'idx'
  | 'name'
  | 'email'
  | 'createdAt'
  | 'updatedAt'
  | 'sortOrder';

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

export type ListResult<T = ITodosPart> = {
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

/** 정렬 옵션 */
export type CommentOrder = 'createdAt' | 'likeCount' | 'replyCount';

export type CommentListParams = {
  /** 본문 uid (Todos.uid) */
  todoId: string;

  /** 루트 목록이면 null(기본). 답글 목록이면 부모 idx */
  parentIdx?: number | null;

  /** 정렬: 루트 목록에서만 적용. 기본=등록순(ASC) */
  sortBy?: CommentOrder;
  order?: 'asc' | 'desc';

  /** 페이지 */
  limit?: number;
  cursor?: string | null; // b64({ sortValue: any, idx: number })

  /** 로그인 사용자 id 전달 시 isMine/isLiked 주입 */
  currentUserId?: string;
};

export type CommentListResult = {
  items: ITodosCommentPart[];
  nextCursor?: string; // b64
  totalAll: number; // baseWhere 기준 총합
  totalFiltered: number; // filteredWhere 기준 총합
};
