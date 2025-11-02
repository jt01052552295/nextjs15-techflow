import { IUser } from '@/types/user';
import type { IFcmTemplate } from '@/types/fcm/template';

export interface IFcmAlarm {
  idx: number;
  uid: string;
  userId: string; // @map("user_id")
  templateId: string | null; // FcmTemplate.uid 참조(@map("template"))
  message: string; // 화면 표시용 메시지
  url: string | null; // 클릭 이동 URL
  isRead: boolean; // default(false)
  createdAt: Date;

  // relations
  user: IUser; // required relation
  template: IFcmTemplate | null;
}

export type IFcmAlarmListRow = IFcmAlarm & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
};

export type SortBy = 'idx';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  templateId?: string;
  message?: string;
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

export type ListResult<T = IFcmAlarm> = {
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
