import { IUser } from '@/types/user';

export interface IPayment {
  idx: number;
  uid: string;
  userId: string;
  customerUid: string; // PG사 고객 고유 UID
  billingKey: string; // PG사 빌링키
  method: string; // 결제 수단 (예: card, vbank)
  name: string; // 결제 수단 명칭 또는 카드 소유자명
  cardName: string; // 카드사명
  cardNumber1: string; // 카드번호 1번째 블럭
  cardNumber2: string; // 카드번호 2번째 블럭
  cardNumber3: string; // 카드번호 3번째 블럭
  cardNumber4: string; // 카드번호 4번째 블럭
  maskedPan: string | null; // 마스킹된 카드번호 전체
  cardMM: string; // 유효기간 월 (MM)
  cardYY: string; // 유효기간 연도 (YYYY)
  cardPwd: string; // 카드 비밀번호 앞 2자리
  cardCvc: string; // CVC 코드
  juminOrCorp: string; // 주민번호 또는 사업자등록번호 앞자리
  isRepresent: boolean; // 대표 결제카드 여부
  createdAt: Date;
  updatedAt: Date;
  isUse: boolean;
  isVisible: boolean;
  user: IUser | null;
}

export type IPaymentListRow = IPayment & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
};

export type ListEditCell = 'name';

export type SortBy = 'idx' | 'userId';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
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

export type ListResult<T = IPayment> = {
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
