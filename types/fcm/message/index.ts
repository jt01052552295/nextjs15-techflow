import { IUser } from '@/types/user';
import type { IFcmTemplate } from '@/types/fcm/template';

export type FcmMessagePlatform = 'app' | 'desktop' | 'mobile';

export interface IFcmMessage {
  idx: number;
  uid: string;
  platform: FcmMessagePlatform; // default("app")
  templateId: string | null; // FcmTemplate.uid 참조(@map("template"))
  userId: string; // @map("user_id")
  fcmToken: string | null; // @db.VarChar(255)
  otCode: string | null; // 주문코드
  title: string | null; // @db.VarChar(255)
  body: string | null; // @db.VarChar(255)
  url: string | null; // @db.VarChar(500)
  res: string | null; // 전송결과 원문(JSON string 등) @db.LongText
  resStatus: string | null; // @db.VarChar(45)
  resMsg: string | null; // @db.VarChar(255)
  createdAt: Date;
  updatedAt: Date;

  // relations
  template: IFcmTemplate | null;
  user: IUser | null; // optional relation
}

export type IFcmMessageListRow = IFcmMessage & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
};

export type SortBy = 'idx';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  platform?: string;
  fcmToken?: string;
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

export type ListResult<T = IFcmMessage> = {
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
