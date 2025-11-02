import type { IFcmAlarm } from '@/types/fcm/alarm';
import type { IFcmMessage } from '@/types/fcm/message';

export interface IFcmTemplate {
  idx: number;
  uid: string;
  type: string; // 예: qa_input, review …
  activity: string; // @db.VarChar(45)
  title: string | null; // @db.VarChar(255)
  body: string | null; // @db.Text
  message: string | null; // @db.Text
  titleEn: string | null; // @db.VarChar(255)
  bodyEn: string | null; // @db.Text
  messageEn: string | null; // @db.Text
  targetLink: string; // default("")
  webTargetLink: string; // default("")
  img1: string; // default("")
  createdAt: Date;
  updatedAt: Date;
  isUse: boolean; // default(true)
  isVisible: boolean; // default(true)

  fcmMessages: IFcmMessage[];
  fcmAlarms: IFcmAlarm[];
}

export type IFcmTemplateListRow = IFcmTemplate & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
};

export type ListEditCell = 'type' | 'activity';

export type SortBy = 'idx' | 'type';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  type?: string;
  activity?: string;
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

export type ListResult<T = IFcmTemplate> = {
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
