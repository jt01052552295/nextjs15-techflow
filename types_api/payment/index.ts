/**
 * TossPay 결제 API DTO (v1)
 * 경로: /types_api/payment/index.ts
 */

import { IApiResult } from '../user/settings';

// ===============================
// 플랜 정보
// ===============================
export type PlanId = 'basic' | 'premium' | 'premiumPlus';

export interface IPlan {
  planId: PlanId;
  planName: string;
  price: number;
}

export const PLANS: Record<PlanId, IPlan> = {
  basic: { planId: 'basic', planName: 'Basic', price: 4900 },
  premium: { planId: 'premium', planName: 'Premium', price: 9900 },
  premiumPlus: { planId: 'premiumPlus', planName: 'Premium+', price: 16900 },
};

// ===============================
// 1. 결제 승인 (Approval)
// POST /api/v1/payments/approve
// ===============================
export interface IPaymentApproveRequest {
  paymentKey: string; // TossPay에서 발급한 결제 키
  orderId: string; // 프론트에서 생성한 주문 ID
  amount: number; // 결제 금액 (원)
}

export interface IPaymentApproveData {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string; // "DONE", "CANCELED", etc.
  totalAmount: number;
  approvedAt: string | null;
  method: string; // "카드", "간편결제", etc.
  card?: ITossCardInfo | null; // TossPay Payment 객체의 card 필드
}

// ===============================
// 2. 구독 정보 조회
// GET /api/v1/payments/subscriptions/me
// ===============================
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export interface ISubscriptionData {
  planId: PlanId;
  planName: string;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  paymentKey?: string;
}

// ===============================
// 3. 구독 취소
// POST /api/v1/payments/subscriptions/cancel
// ===============================
export interface ISubscriptionCancelData {
  planId: PlanId;
  status: 'cancelled';
  expiresAt: string;
}

// ===============================
// 4. 결제 취소 (환불)
// POST /api/v1/payments/cancel
// ===============================
export interface IPaymentCancelRequest {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number; // 부분 취소 시 사용 (선택)
}

export interface IPaymentCancelData {
  paymentKey: string;
  orderId: string;
  status: string;
  cancelAmount: number;
  cancelReason: string;
  canceledAt: string;
}

// ===============================
// TossPay API 응답 타입 (공식 문서 기준)
// https://docs.tosspayments.com/reference#payment-객체
// ===============================

/**
 * Payment 객체 내 card 필드
 */
export interface ITossCardInfo {
  issuerCode: string; // 카드 발급사 코드 (2자리)
  acquirerCode: string; // 카드 매입사 코드 (2자리)
  number: string; // 마스킹된 카드번호
  installmentPlanMonths: number; // 할부 개월 수 (일시불: 0)
  isInterestFree: boolean; // 무이자 여부
  interestPayer: string | null; // 할부 수수료 부담 주체
  approveNo: string; // 카드사 승인 번호
  useCardPoint: boolean; // 카드사 포인트 사용 여부
  cardType: string; // "신용", "체크", "기프트"
  ownerType: string; // "개인", "법인", "미확인"
  acquireStatus: string; // 매입 상태
  amount: number; // 카드 결제 금액
}

/**
 * Payment 객체 내 cancels 배열 요소
 */
export interface ITossCancelInfo {
  transactionKey: string;
  cancelReason: string;
  taxExemptionAmount: number;
  canceledAt: string;
  easyPayDiscountAmount?: number;
  receiptKey: string | null;
  cancelAmount: number;
  taxFreeAmount: number;
  refundableAmount: number;
  cancelStatus: string;
  cancelRequestId: string | null;
}

/**
 * 결제 승인/조회 응답 (Payment 객체)
 */
export interface ITossPaymentConfirmResponse {
  mId: string;
  lastTransactionKey: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  taxExemptionAmount: number;
  status: string; // "DONE", "CANCELED", "WAITING_FOR_DEPOSIT", etc.
  requestedAt: string;
  approvedAt: string | null;
  useEscrow: boolean;
  cultureExpense: boolean;
  card: ITossCardInfo | null;
  virtualAccount: unknown | null;
  transfer: unknown | null;
  mobilePhone: unknown | null;
  giftCertificate: unknown | null;
  cashReceipt: unknown | null;
  cashReceipts: unknown | null;
  discount: unknown | null;
  cancels: ITossCancelInfo[] | null;
  secret: string | null;
  type: string; // "NORMAL", "BILLING", "BRANDPAY"
  easyPay: { provider: string; amount: number; discountAmount: number } | null;
  country: string;
  failure: { code: string; message: string } | null;
  isPartialCancelable: boolean;
  receipt: { url: string } | null;
  checkout: { url: string } | null;
  currency: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  taxFreeAmount: number;
  metadata: Record<string, string> | null;
  method: string;
  version: string;
}

/**
 * 결제 취소 응답 (Payment 객체와 동일)
 */
export type ITossPaymentCancelResponse = ITossPaymentConfirmResponse;

export interface ITossErrorResponse {
  code: string;
  message: string;
}

// ===============================
// API 결과 타입 (편의용)
// ===============================
export type IPaymentApproveResult = IApiResult<IPaymentApproveData>;
export type ISubscriptionResult = IApiResult<ISubscriptionData | null>;
export type ISubscriptionCancelResult = IApiResult<ISubscriptionCancelData>;
export type IPaymentCancelResult = IApiResult<IPaymentCancelData>;
