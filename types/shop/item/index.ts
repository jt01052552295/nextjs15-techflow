import { IShopCategory } from '@/types/shop/category';

export interface IShopItem {
  idx: number;
  uid: string;
  cid: string;
  shopId: number; // 상점 ID
  code: string; // 상품 코드
  categoryCode: string; // 카테고리 코드
  name: string; // 상품명
  nameEn: string; // 상품명(영문)
  desc1: string; // 한줄 설명
  basicPrice: number; // 기본가
  basicPriceDc: number; // 기본가 할인
  salePrice: number; // 판매가
  basicDesc?: string | null; // 기본 설명 (nullable)
  etcDesc?: string | null; // 추가 설명 (nullable)
  useBasicPeople: number; // 포함 인원수(기본)
  useAccount: number; // 포함 계정수
  useMaxPeople: number; // 최대 인원수
  useMaxSign: number; // 최대 서명수
  useMaxUpload: number; // 최대 업로드수
  useDuration: number; // 이용기간(일)
  rSend: boolean; // 발송 여부
  stock: number; // 재고
  ymd: string; // YYYYMMDD
  his: string; // HHMMSS
  createdAt: Date; // 생성일
  updatedAt: Date; // 수정일
  isUse: boolean; // 사용
  isVisible: boolean; // 표시
  isNft: boolean; // NFT 여부
  isSoldout: boolean; // 품절 여부
  orderMinimumCnt: number; // 최소 주문수량
  orderMaximumCnt: number; // 최대 주문수량
  sortOrder: number; // 정렬순서

  ShopCategory: IShopCategory;
  ShopItemFile: IShopItemFile[];
  ShopItemOption: IShopItemOption[];
  ShopItemSupply: IShopItemSupply[];
}
export type IShopItemPart = Partial<IShopItem>;

export type IShopItemCounts = {
  ShopItemFile: number;
  ShopItemOption: number;
  ShopItemSupply: number;
};

export type IShopItemListRow = IShopItem & {
  createdAt: string; // ISO 문자열
  updatedAt: string; // ISO 문자열
  _count: IShopItemCounts;
};

// ===== ShopItemFile =====
export interface IShopItemFile {
  idx: number;
  uid: string;
  pid: string; // 부모 UID(상품 uid)
  name: string; // 파일명
  url: string; // 파일 URL
  ext: string; // 확장자
  originalName: string; // 원본 파일명
  size: number; // 파일 크기(바이트)
  type: string; // 파일 타입
  createdAt: Date; // 생성일
  updatedAt: Date; // 수정일
}
export type IShopItemFilePart = Partial<IShopItemFile>;
export type IShopItemFileListRow = IShopItemFile & {
  createdAt: string;
  updatedAt: string;
};

// ===== ShopItemOption =====
export interface IShopItemOption {
  idx: number;
  uid: string;
  pid: string; // 상품 ID
  gubun: string; // 구분
  parentId: number; // 부모 옵션 ID (루트면 0)
  choiceType: string; // 선택 유형
  name: string; // 옵션명
  price: number; // 옵션 추가금액
  stock: number; // 재고
  buyMin: number; // 최소 구매수량
  buyMax: number; // 최대 구매수량
  isUse: boolean; // 사용
  isVisible: boolean; // 표시
  isSoldout: boolean; // 품절 여부
  createdAt: Date; // 생성일
  updatedAt: Date; // 수정일
}
export type IShopItemOptionPart = Partial<IShopItemOption>;
export type IShopItemOptionListRow = IShopItemOption & {
  createdAt: string;
  updatedAt: string;
};

// ===== ShopItemSupply =====
export interface IShopItemSupply {
  idx: number;
  uid: string;
  pid: string; // 상품 ID
  gubun: string; // 구분
  parentId: number; // 부모 구성 ID (루트면 0)
  choiceType: string; // 선택 유형
  name: string; // 구성명
  price: number; // 구성 추가금액
  stock: number; // 재고
  isUse: boolean; // 사용
  isVisible: boolean; // 표시
  isSoldout: boolean; // 품절 여부
  createdAt: Date; // 생성일
  updatedAt: Date; // 수정일
}
export type IShopItemSupplyPart = Partial<IShopItemSupply>;
export type IShopItemSupplyListRow = IShopItemSupply & {
  createdAt: string;
  updatedAt: string;
};

export type ListEditCell = 'name';

export type SortBy = 'idx' | 'code' | 'sortOrder' | 'createdAt' | 'updatedAt';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  code?: string;
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

export type ListResult<T = IShopItem> = {
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
