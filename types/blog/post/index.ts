import type { PostStatus, PostVisibility } from '@prisma/client';
import type { IBlogCategory } from '@/types/blog/category';
import { IUser } from '@/types/user';

export interface IBlogPost {
  idx: number;
  uid: string;
  cid: string;

  userId: string;
  lang: string;

  content: string;
  linkUrl?: string | null;

  categoryCode?: string | null;

  status: PostStatus;
  visibility: PostVisibility;

  likeCount: number;
  commentCount: number;
  isPinned: boolean;

  isUse: boolean;
  isVisible: boolean;
  sortOrder: number;

  scheduledAt?: Date | null;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // 관계 (필요할 때만 씀)
  blogCategory?: IBlogCategory | null;
  user?: IUser | null;

  comments: any; // 관계된 댓글
  images: IBlogPostFile[]; // 관계된 파일
}
export type IBlogPostPart = Partial<IBlogPost>;

export type IBlogPostCounts = {
  comments: number;
  images: number;
};

export type IBlogPostListRow = IBlogPost & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
  _count: IBlogPostCounts;
};

export type ListEditCell = 'name';

export type SortBy = 'idx' | 'sortOrder' | 'createdAt' | 'updatedAt';

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

export type ListResult<T = IBlogPostListRow> = {
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

export interface IBlogPostFile {
  idx: number;
  uid: string;
  postId: string;
  originalName: string; // ✅ 유저가 업로드한 원본 파일명
  url: string; // 서버 저장 URL
  size: number; // ✅ 파일 크기 (bytes)
  ext: string; // ✅ 확장자명 (pdf, zip, jpg 등)
  type: string; // ✅ MIME 타입 (application/pdf, image/png 등)
  createdAt: Date; // ✅ 업로드 시각 (ISO string)
  updatedAt: Date; // ✅ 수정 시각 (ISO string)
}
export type IBlogPostFileWithoutIDX = Omit<IBlogPostFile, 'idx'>;

export interface IBlogPostFileWithPreview extends IBlogPostFile {
  previewUrl?: string;
}
export type IBlogPostFilePart = Partial<IBlogPostFileWithPreview>;
