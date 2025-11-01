import { IUser } from '@/types/user';

export interface IAddress {
  idx: number;
  uid: string;
  userId: string;
  title: string; // 배송지명
  name: string; // 수령인명
  zipcode: string; // 우편번호
  addr1: string; // 주소
  addr2: string; // 상세주소
  addrJibeon: string; // 지번주소
  sido: string; // 시도
  gugun: string; // 구군
  dong: string; // 동
  latNum: string | null; // 위도
  lngNum: string | null; // 경도
  hp: string; // 휴대폰번호
  tel: string; // 전화번호
  isDefault: boolean; // 기본배송지 여부
  rmemo: DeliveryMemoCode; // 배송 메모 타입
  rmemoTxt: string | null; // 배송 메모 직접입력 (rmemo가 CUSTOM일 때 사용)
  doorPwd: string | null; // 현관 출입번호
  createdAt: Date;
  updatedAt: Date;
  isUse: boolean;
  isVisible: boolean;
  user: IUser | null;
}

export type IAddressListRow = IAddress & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
};

export type DeliveryMemoCode =
  | 'CALL_BEFORE'
  | 'KNOCK'
  | 'MEET_OUTSIDE'
  | 'CUSTOM';

export type ListEditCell = 'title';

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

export type ListResult<T = IAddress> = {
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
