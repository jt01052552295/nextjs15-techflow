import type { LocaleType } from '@/constants/i18n';
import type { UserRole } from '@prisma/client';

export type CancelReasonRole = Extract<UserRole, 'USER' | 'COMPANY'>;

/* ===============================
 * 주문 상태 (orderStatus)
 * =============================== */

export const SHOP_ORDER_STATUS_I18N = {
  ko: {
    order_pending: '주문접수',
    payment_complete: '결제완료',
    prepare: '상품준비중',
    shipping: '배송중',
    delivered: '배송완료',
    purchase_confirmed: '구매확정',
    cancelled: '주문취소',
  },
  en: {
    order_pending: 'Order Received',
    payment_complete: 'Payment Completed',
    prepare: 'Preparing Item',
    shipping: 'Shipping',
    delivered: 'Delivered',
    purchase_confirmed: 'Purchase Confirmed',
    cancelled: 'Order Cancelled',
  },
} as const;

export type ShopOrderStatusCode = keyof (typeof SHOP_ORDER_STATUS_I18N)['ko'];

export function getOrderStatusLabel(
  code: string,
  lang: LocaleType = 'ko',
): string {
  const dict = SHOP_ORDER_STATUS_I18N[lang] ?? SHOP_ORDER_STATUS_I18N.ko;
  return dict[code as ShopOrderStatusCode] ?? code;
}

/* ===============================
 * 취소 상태 (cancelStatus)
 * =============================== */

export const SHOP_ORDER_CANCEL_STATUS_I18N = {
  ko: {
    none: '취소 없음',
    requested: '취소요청',
    processing: '취소처리중',
    completed: '취소완료',
    rejected: '취소거절',
  },
  en: {
    none: 'No Cancellation',
    requested: 'Cancellation Requested',
    processing: 'Cancellation In Progress',
    completed: 'Cancellation Completed',
    rejected: 'Cancellation Rejected',
  },
} as const;

export type ShopOrderCancelStatusCode =
  keyof (typeof SHOP_ORDER_CANCEL_STATUS_I18N)['ko'];

export function getOrderCancelStatusLabel(
  code: string,
  lang: LocaleType = 'ko',
): string {
  if (!code || code === 'none') {
    return '-';
  }

  const dict =
    SHOP_ORDER_CANCEL_STATUS_I18N[lang] ?? SHOP_ORDER_CANCEL_STATUS_I18N.ko;

  return dict[code as ShopOrderCancelStatusCode] ?? code;
}

/* ===============================
 * 취소 요청 주체 (cancelRequestedBy)
 *  - Prisma UserRole(enum) 값에 맞춰 키 사용
 * =============================== */

export const SHOP_ORDER_CANCEL_REQUESTER_I18N = {
  ko: {
    USER: '일반회원',
    COMPANY: '판매업체',
    ADMIN: '관리자',
    EXTRA: '기타',
  },
  en: {
    USER: 'User',
    COMPANY: 'Seller',
    ADMIN: 'Admin',
    EXTRA: 'Extra',
  },
} as const;

export type ShopOrderCancelRequesterCode =
  keyof (typeof SHOP_ORDER_CANCEL_REQUESTER_I18N)['ko'];

export function getOrderCancelRequesterLabel(
  code: string,
  lang: LocaleType = 'ko',
): string {
  if (!code) return '-';

  const dict =
    SHOP_ORDER_CANCEL_REQUESTER_I18N[lang] ??
    SHOP_ORDER_CANCEL_REQUESTER_I18N.ko;

  return dict[code as ShopOrderCancelRequesterCode] ?? code;
}

/* ===============================
 * 취소 사유 (cancelReasonCode)
 *  - 역할별(UserRole: USER / COMPANY)로 분리
 * =============================== */

export const SHOP_ORDER_CANCEL_REASON_I18N = {
  USER: {
    ko: {
      change_mind: '단순 변심',
      ordered_by_mistake: '주문 실수',
      wrong_address: '배송지 정보 오류',
      change_payment_method: '결제수단 변경',
      delayed_shipping: '배송 지연',
      duplicate_order: '중복 주문',
      coupon_issue: '쿠폰/할인 문제',
      other: '기타(직접 입력)',
    },
    en: {
      change_mind: 'Changed Mind',
      ordered_by_mistake: 'Ordered by Mistake',
      wrong_address: 'Wrong Address Info',
      change_payment_method: 'Change Payment Method',
      delayed_shipping: 'Delayed Shipping',
      duplicate_order: 'Duplicate Order',
      coupon_issue: 'Coupon / Discount Issue',
      other: 'Other (Custom)',
    },
  },

  COMPANY: {
    ko: {
      out_of_stock: '품절/재고 부족',
      pricing_error: '가격 설정 오류',
      product_issue: '상품 문제(손상/불량 등)',
      cannot_ship_area: '배송 불가지역',
      wrong_listing: '상품 정보/옵션 오등록',
      fraud_suspected: '이상 주문/사기 의심',
      policy_violation: '운영정책 위반',
      other: '기타(직접 입력)',
    },
    en: {
      out_of_stock: 'Out of Stock',
      pricing_error: 'Pricing Error',
      product_issue: 'Product Issue (Damaged/Defective)',
      cannot_ship_area: 'Undeliverable Area',
      wrong_listing: 'Wrong Product Info/Option',
      fraud_suspected: 'Suspicious/Fraudulent Order',
      policy_violation: 'Policy Violation',
      other: 'Other (Custom)',
    },
  },
} as const;

export type UserCancelReasonCode =
  keyof (typeof SHOP_ORDER_CANCEL_REASON_I18N)['USER']['ko'];

export type CompanyCancelReasonCode =
  keyof (typeof SHOP_ORDER_CANCEL_REASON_I18N)['COMPANY']['ko'];

export type ShopOrderCancelReasonCode =
  | UserCancelReasonCode
  | CompanyCancelReasonCode;

export function getOrderCancelReasonLabel(
  role: CancelReasonRole,
  code: string,
  lang: LocaleType = 'ko',
): string {
  if (!code) return '-';

  const roleDict = SHOP_ORDER_CANCEL_REASON_I18N[role];
  if (!roleDict) return code;

  const dict = (roleDict[lang] ?? roleDict.ko) as Record<string, string>;

  return dict[code] ?? code;
}

/**
 * 주문 상태 코드(orderStatus)를 다국어 라벨로 변환한다.
 *
 * @param code - 주문 상태 코드 (예: 'payment_complete', 'shipping' 등)
 * @param lang - 언어 코드 (기본값: 'ko')
 *
 * 사용 예시:
 *   const labelKo = getOrderStatusLabel(row.orderStatus, 'ko');
 *   // 예: 'payment_complete' -> '결제완료'
 *
 *   const labelEn = getOrderStatusLabel(row.orderStatus, 'en');
 *   // 예: 'payment_complete' -> 'Payment Completed'
 *
 * JSX 예시:
 *   <td className="text-center">
 *     {getOrderStatusLabel(row.orderStatus, currentLang)}
 *   </td>
 */

/**
 * 취소 상태 코드(cancelStatus)를 다국어 라벨로 변환한다.
 * (취소 없음: '' 또는 'none' 인 경우 '-' 반환)
 *
 * @param code - 취소 상태 코드 (예: '', 'none', 'requested', 'completed' 등)
 * @param lang - 언어 코드 (기본값: 'ko')
 *
 * 사용 예시:
 *   const label = getOrderCancelStatusLabel(row.cancelStatus, 'ko');
 *   // 예: '' 또는 'none' -> '-'
 *   //     'requested'      -> '취소요청'
 *
 * JSX 예시:
 *   <td className="text-center">
 *     {getOrderCancelStatusLabel(row.cancelStatus, currentLang)}
 *   </td>
 */

/**
 * 취소 요청 주체 코드(cancelRequestedBy)를 다국어 라벨로 변환한다.
 *
 * @param code - 요청 주체 코드 (UserRole 기반: 'USER' | 'COMPANY' | 'ADMIN' | 'EXTRA')
 * @param lang - 언어 코드 (기본값: 'ko')
 *
 * 사용 예시:
 *   const label = getOrderCancelRequesterLabel(row.cancelRequestedBy, 'ko');
 *   // 예: 'USER'    -> '일반회원'
 *   //     'COMPANY' -> '판매업체'
 *   //     'ADMIN'   -> '관리자'
 *
 * JSX 예시:
 *   <td className="text-center">
 *     {getOrderCancelRequesterLabel(row.cancelRequestedBy, currentLang)}
 *   </td>
 */

/**
 * 취소 사유 코드(cancelReasonCode)를 다국어 라벨로 변환한다.
 * 역할별로 서로 다른 사유 목록을 사용한다. (UserRole: USER / COMPANY)
 *
 * @param role - 취소 요청 역할 (CancelReasonRole: 'USER' | 'COMPANY')
 * @param code - 취소 사유 코드 (role에 따라 유효한 코드가 다름)
 * @param lang - 언어 코드 (기본값: 'ko')
 *
 * 사용 예시:
 *   // 1) 일반회원(USER)이 취소를 요청한 경우
 *   const labelUser = getOrderCancelReasonLabel('USER', 'change_mind', 'ko');
 *   //  -> '단순 변심'
 *
 *   // 2) 판매업체(COMPANY)가 취소를 요청한 경우
 *   const labelCompany = getOrderCancelReasonLabel('COMPANY', 'out_of_stock', 'ko');
 *   //  -> '품절/재고 부족'
 *
 *   // 3) cancelRequestedBy(UserRole)를 기반으로 역할을 계산해서 사용하는 예시
 *   const role: CancelReasonRole =
 *     row.cancelRequestedBy === 'COMPANY' ? 'COMPANY' : 'USER';
 *
 *   const reasonLabel = getOrderCancelReasonLabel(
 *     role,
 *     row.cancelReasonCode,
 *     currentLang,
 *   );
 *
 * JSX 예시:
 *   <td className="text-start">
 *     {getOrderCancelReasonLabel(
 *       row.cancelRequestedBy === 'COMPANY' ? 'COMPANY' as const : 'USER',
 *       row.cancelReasonCode,
 *       currentLang,
 *     )}
 *   </td>
 */
