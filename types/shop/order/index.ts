import { IUser } from '@/types/user';
import { IShopItem, IShopItemOption, IShopItemSupply } from '@/types/shop/item';
import {
  type ShopOrderStatusCode,
  type ShopOrderCancelStatusCode,
} from '@/lib/shop/status-utils';

// ===== 주문 메인 =====
export interface IShopOrder {
  idx: number;
  uid: string;
  ordNo: string; // 주문번호
  shopId: number; // 쇼핑몰 ID
  sellerId: number; // 판매자 ID
  userId?: string | null; // 회원 ID (비회원은 세션ID 저장)
  userIdx: number; // 회원 번호
  gubun: string; // 구분(일반/단체/정기 등)

  basicPrice: number; // 기본 상품 금액 합계
  optionPrice: number; // 옵션 추가 금액 합계
  deliveryPrice: number; // 배송비
  boxDc: number; // 포장/박스 할인
  payPrice: number; // 총 결제 금액
  stock: number; // 재고 반영 여부

  memo?: string | null; // 주문 메모

  orderPaid: string; // 결제 여부 상태
  orderStatus: string; // 주문 상태
  cancelStatus: string; // 취소 상태
  cancelRequestedBy: string; // 취소 요청자 (USER, COMPANY)
  cancelRequestedAt?: Date | null; // 취소 요청일시
  cancelReasonCode: string; // 취소 사유 코드
  cancelReasonText?: string | null; // 취소 사유 상세
  cancelRejectedReasonText?: string | null; // 취소 거절 사유

  paymethod: string; // 결제 수단

  // 주문자 정보
  name: string; // 주문자명
  email: string; // 주문자 이메일
  hp: string; // 주문자 휴대폰
  zipcode: string; // 주문자 우편번호
  jibunAddr1: string; // 지번 주소1
  jibunAddr2: string; // 지번 주소2
  roadAddr1: string; // 도로명 주소1
  roadAddr2: string; // 도로명 주소2

  // 수령자 정보
  rcvStore: string; // 수령 매장명
  rcvName: string; // 수령자명
  rcvHp: string; // 수령자 연락처
  rcvEmail: string; // 수령자 이메일
  rcvDate?: Date | null; // 희망 수령일
  rcvAddr1: string; // 수령 주소1
  rcvAddr2: string; // 수령 주소2
  rcvZipcode: string; // 수령자 우편번호

  // 결제 관련 정보
  bankAccount: number; // 무통장입금 계좌 ID
  bankDepositName: string; // 입금자명
  payEmail: string; // 결제자 이메일
  payRepresent: number; // 대표 결제 여부
  payDay: string; // 결제일
  payYear: boolean; // 연결제 여부
  payPeople: number; // 사용 인원

  ipAddress: string; // IP 주소
  merchantData?: string | null; // PG사 연동용 원본 데이터

  createdAt: Date;
  isUse: boolean;
  isVisible: boolean;

  // 관계
  ShopOrderItem: IShopOrderItem[];
  ShopOrderPayment: IShopOrderPayment[];

  User?: IUser | null; // 별도 정의
  // ShopSubscription?: IShopSubscription[]; // 별도 정의
  // PortoneSchedulePayment?: IPortoneSchedulePayment[]; // 별도 정의
  // ShopReview?: IShopReview[]; // 별도 정의
}

// 부분 타입
export type IShopOrderPart = Partial<IShopOrder>;

// 리스트에서 카운트용
export type IShopOrderCounts = {
  ShopOrderItem: number;
  ShopReview: number;
};

// 목록용 Row (날짜는 문자열로 받을 때)
export type IShopOrderListRow = IShopOrder & {
  createdAt: string;
  cancelRequestedAt?: string | null;
  rcvDate?: string | null;
  _count: IShopOrderCounts;
};

// ===== 주문 상품 =====
export interface IShopOrderItem {
  idx: number;
  uid: string;
  orderId: number; // ShopOrder.idx
  itemId: number; // ShopItem.idx
  itemName: string; // 상품명
  quantity: number; // 수량
  salePrice: number; // 기본 판매가
  optionPrice: number; // 옵션 추가금액
  supplyPrice: number; // 추가상품 금액
  totalPrice: number; // 총 결제예정금액
  cartNo?: string | null; // 장바구니 고유코드
  statusCode: string; // 상품별 상태코드
  createdAt: Date;

  // 관계
  ShopOrder: IShopOrder;
  ShopItem: IShopItem;
  ShopOrderOption: IShopOrderOption[];
  ShopOrderSupply: IShopOrderSupply[];
}

export type IShopOrderItemPart = Partial<IShopOrderItem>;

export type IShopOrderItemListRow = IShopOrderItem & {
  createdAt: string;
};

// ===== 주문 옵션 =====
export interface IShopOrderOption {
  idx: number;
  uid: string;
  orderItemId: number; // ShopOrderItem.idx
  optionId: number; // ShopItemOption.idx
  name: string; // 옵션명
  price: number; // 옵션 가격
  quantity: number; // 옵션 수량
  createdAt: Date;

  // 관계
  ShopOrderItem: IShopOrderItem;
  ShopItemOption: IShopItemOption;
}

export type IShopOrderOptionPart = Partial<IShopOrderOption>;

// ===== 주문 추가상품 =====
export interface IShopOrderSupply {
  idx: number;
  uid: string;
  orderItemId: number; // ShopOrderItem.idx
  supplyId: number; // ShopItemSupply.idx
  name: string; // 추가상품명
  price: number; // 추가상품 가격
  quantity: number; // 추가상품 수량
  createdAt: Date;

  // 관계
  ShopOrderItem: IShopOrderItem;
  ShopItemSupply: IShopItemSupply;
}

export type IShopOrderSupplyPart = Partial<IShopOrderSupply>;

// ===== 결제 정보 =====
export interface IShopOrderPayment {
  idx: number;
  uid: string;
  orderId: number; // ShopOrder.idx

  gubun: string; // 구분값 (shop, subs 등)

  applyNum: string; // PG 승인번호
  amount: number; // 결제 요청 금액
  cancelAmount: number; // 취소된 금액

  buyerAddr: string; // 구매자 주소
  buyerEmail: string; // 구매자 이메일
  buyerName: string; // 구매자 이름
  buyerPostcode: string; // 구매자 우편번호
  buyerTel: string; // 구매자 연락처

  cardName: string; // 카드사명
  cardNumber: string; // 카드 번호 (마스킹)
  cardQuota: number; // 할부 개월 수

  customData?: string | null; // 사용자 정의 데이터

  impUid: string; // 아임포트 거래 고유번호
  merchantUid: string; // 주문 고유번호 (내부)
  name: string; // 결제 상품명

  paidAmount: number; // 실결제 금액
  paidAt: number; // 결제 완료 시각 (timestamp)
  cancelledAt: number; // 결제 취소 시각 (timestamp)

  payMethod: string; // 결제 수단
  pgProvider: string; // PG사 이름
  pgTid: string; // PG 거래번호
  pgType: string; // 결제 PG 타입
  receiptUrl: string; // 영수증 URL
  status: string; // 결제 상태 (paid, cancelled 등)

  orderData?: string | null; // 주문 데이터 백업
  device: string; // 접속 기기정보
  shopId: number; // 쇼핑몰 ID
  sellerId: number; // 판매자 ID

  createdAt: Date;
  isUse: boolean;
  isVisible: boolean;

  // 관계
  ShopOrder: IShopOrder;
}

export type IShopOrderPaymentPart = Partial<IShopOrderPayment>;

// 결제 목록용 Row
export type IShopOrderPaymentListRow = IShopOrderPayment & {
  createdAt: string;
};

export type SortBy = 'idx' | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  name?: string;
  email?: string;
  hp?: string;
  ordNo?: string;
  dateType?: 'createdAt';
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

export type ListResult<T = IShopOrder> = {
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

export type OrderStatusInput = {
  uid?: string;
  uids?: string[];
  orderStatus: ShopOrderStatusCode;
};

export type OrderStatusResult = {
  mode: 'single' | 'bulk';
  affected: number; // 업데이트(soft) or 삭제(hard)된 개수
};

export type CancelStatusInput = {
  uid?: string;
  uids?: string[];
  cancelStatus: ShopOrderCancelStatusCode;
  cancelReasonCode: string;
  cancelReasonText?: string;
};

export type CancelStatusResult = {
  mode: 'single' | 'bulk';
  affected: number; // 업데이트(soft) or 삭제(hard)된 개수
  order?: any;
};
