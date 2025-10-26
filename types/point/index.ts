import { IUser } from '@/types/user';

export interface IPoint {
  idx: number;
  userId: string;
  point: number;
  usePoint: number;
  status: string;
  expired: boolean;
  otGubun: string;
  otCode: string;
  message: string;
  createdAt: Date;
  expiredAt: Date | null;

  user?: IUser | null;
}
export type IPointPart = Partial<IPoint>;

export type IPointListRow = IPoint & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  expiredAt: string | null; // DTO에서 ISO 문자열로 변환
};

export type SortBy = 'idx' | 'createdAt' | 'expiredAt';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  dateType?: 'createdAt' | 'expiredAt';
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

export type ListResult<T = IPoint> = {
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
