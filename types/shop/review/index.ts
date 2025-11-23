import { IUser } from '@/types/user';
export interface IShopReview {
  idx: number;
  uid: string;

  orderId?: number | null; // 주문 마스터 ID (nullable)
  itemId: number; // 리뷰 대상 상품 ID
  userId?: string | null; // 작성자 회원 ID (nullable)

  name?: string | null; // 작성자 이름
  email?: string | null; // 작성자 이메일
  subject: string; // 리뷰 제목
  content: string; // 리뷰 내용

  createdAt: Date; // JavaScript Date 객체로 처리
  updatedAt: Date;

  score: number; // 평점
  hit: number; // 조회수
  good: number; // 추천 수
  bad: number; // 비추천 수

  isUse: boolean; // 사용 여부
  isVisible: boolean; // 노출 여부
  isSecret: boolean; // 비공개 여부
  isAdmin: boolean; // 관리자 작성 여부

  user?: IUser | null; // required relation
}

export type IShopReviewPart = Partial<IShopReview>;

export type IShopReviewListRow = IShopReview & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
};

export type ListEditCell = 'name' | 'email';

export type SortBy = 'idx' | 'createdAt' | 'updatedAt';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  email?: string;
  name?: string;
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

export type ListResult<T = IShopReview> = {
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
