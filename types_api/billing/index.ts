/**
 * TossPay 자동결제(빌링) API DTO (v1)
 * 경로: /types_api/billing/index.ts
 *
 * 프론트엔드와 공유하는 타입 정의
 */

import type { IApiResult } from '../user/settings';
import type { PlanId, IPlan } from '../payment';
import { PLANS } from '../payment';

// Re-export
export type { PlanId, IPlan };
export { PLANS };

// ===============================
// 1. 빌링키 발급 (카드 등록)
// POST /api/v1/billing/card/issue
// ===============================
export interface IBillingCardIssueRequest {
  authKey: string; // TossPay SDK에서 받은 인증키
}

export interface IBillingCardData {
  uid: string; // 카드 고유 ID (UserPayment.uid)
  cardName: string; // 카드사명 (삼성카드, 현대카드 등)
  cardNumber: string; // 마스킹된 카드번호 (1234****5678)
  isRepresent: boolean; // 대표 결제수단 여부
  createdAt: string; // 등록일시 (ISO 8601)
}

// ===============================
// 2. 카드 목록 조회
// GET /api/v1/billing/card/list
// ===============================
export type IBillingCardListData = IBillingCardData[];

// ===============================
// 3. 대표 결제수단 설정
// POST /api/v1/billing/card/primary
// ===============================
export interface IBillingPrimaryRequest {
  cardUid: string; // 대표카드로 설정할 카드 uid
}

// ===============================
// 4. 정기결제 구독 시작
// POST /api/v1/billing/subscribe
// ===============================
export interface IBillingSubscribeRequest {
  planId: PlanId; // 구독할 플랜 ID
}

export interface IBillingSubscribeData {
  subscriptionUid: string; // 구독 고유 ID
  planId: PlanId;
  planName: string;
  status: 'active' | 'pending';
  startedAt: string; // 구독 시작일 (ISO 8601)
  nextPaymentDate: string; // 다음 결제 예정일 (ISO 8601)
  paymentKey: string; // 첫 결제 paymentKey
}

// ===============================
// 5. 빌링키로 즉시 결제
// POST /api/v1/billing/pay
// ===============================
export interface IBillingPayRequest {
  cardUid: string; // 결제에 사용할 카드 uid
  amount: number; // 결제 금액
  orderName: string; // 주문명
}

export interface IBillingPayData {
  paymentKey: string;
  orderId: string;
  amount: number;
  approvedAt: string; // 결제 승인일시 (ISO 8601)
}

// ===============================
// 6. 정기결제 해지
// POST /api/v1/billing/unsubscribe
// ===============================
export interface IBillingUnsubscribeData {
  planId: PlanId;
  status: 'cancelled';
  expiresAt: string; // 서비스 만료일 (ISO 8601)
  message: string; // 안내 메시지
}

// ===============================
// 7. 구독 정보 조회
// GET /api/v1/billing/subscription
// ===============================
export type BillingSubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'paused'
  | 'pending';

export interface IBillingSubscriptionData {
  subscriptionUid: string;
  planId: PlanId;
  planName: string;
  status: BillingSubscriptionStatus;
  startedAt: string;
  expiresAt: string;
  nextPaymentDate: string | null;
  cardUid: string | null; // 연결된 카드 uid
  cardName: string | null; // 연결된 카드사명
  cardNumber: string | null; // 연결된 카드번호 (마스킹)
}

// ===============================
// Cron API 응답 (관리자용)
// ===============================
export interface ICronBillingData {
  processed: number;
  succeeded: number;
  failed: number;
  failedSubscriptions: string[]; // 실패한 구독 uid 목록
}

export interface ICronRetryData {
  retried: number;
  succeeded: number;
  failed: number;
}

// ===============================
// TossPay 빌링 API 응답 타입 (공식 문서 기준)
// https://docs.tosspayments.com/reference#billing-객체
// ===============================

/**
 * 빌링키 발급 응답 (Billing 객체)
 * POST /v1/billing/authorizations/issue
 */
export interface ITossBillingKeyResponse {
  mId: string; // 상점 ID
  customerKey: string; // 구매자 ID
  authenticatedAt: string; // 인증 시점 (ISO 8601)
  method: string; // 결제수단 ("카드")
  billingKey: string; // 발급된 빌링키
  card: ITossBillingCardInfo | null; // 카드 정보
  cardCompany: string | null; // 카드 발급사명 (deprecated, 호환용)
  cardNumber: string | null; // 마스킹된 카드번호 (deprecated, 호환용)
  transfer: ITossBillingTransferInfo[] | null; // 계좌 정보 (CMS 자동결제용)
}

/**
 * Billing 객체 내 card 필드
 */
export interface ITossBillingCardInfo {
  issuerCode: string; // 카드 발급사 코드 (2자리)
  acquirerCode: string; // 카드 매입사 코드 (2자리)
  number: string; // 마스킹된 카드번호
  cardType: string; // 카드 종류: "신용", "체크", "기프트"
  ownerType: string; // 소유자 타입: "개인", "법인"
}

/**
 * Billing 객체 내 transfer 필드 (CMS 자동결제용)
 */
export interface ITossBillingTransferInfo {
  bankName: string;
  bankAccountNumber: string;
}

/**
 * 자동결제 승인 응답 (Payment 객체)
 * POST /v1/billing/{billingKey}
 * https://docs.tosspayments.com/reference#payment-객체
 */
export interface ITossBillingPaymentResponse {
  mId: string;
  lastTransactionKey: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  taxExemptionAmount: number;
  status: string; // "DONE", "CANCELED", etc.
  requestedAt: string;
  approvedAt: string;
  useEscrow: boolean;
  cultureExpense: boolean;
  card: ITossPaymentCardInfo | null;
  virtualAccount: unknown | null;
  transfer: unknown | null;
  mobilePhone: unknown | null;
  giftCertificate: unknown | null;
  cashReceipt: unknown | null;
  cashReceipts: unknown | null;
  discount: unknown | null;
  cancels: ITossPaymentCancel[] | null;
  secret: string | null;
  type: string; // "BILLING"
  easyPay: ITossEasyPay | null;
  country: string;
  failure: ITossFailure | null;
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
  method: string; // "카드"
  version: string;
}

/**
 * Payment 객체 내 card 필드
 */
export interface ITossPaymentCardInfo {
  issuerCode: string;
  acquirerCode: string;
  number: string;
  installmentPlanMonths: number;
  isInterestFree: boolean;
  interestPayer: string | null; // "BUYER", "CARD_COMPANY", "MERCHANT"
  approveNo: string;
  useCardPoint: boolean;
  cardType: string; // "신용", "체크", "기프트"
  ownerType: string; // "개인", "법인", "미확인"
  acquireStatus: string; // "READY", "REQUESTED", "COMPLETED", "CANCEL_REQUESTED", "CANCELED"
  amount: number;
}

/**
 * Payment 객체 내 cancels 배열 요소
 */
export interface ITossPaymentCancel {
  transactionKey: string;
  cancelReason: string;
  taxExemptionAmount: number;
  canceledAt: string;
  easyPayDiscountAmount?: number;
  receiptKey: string | null;
  cancelAmount: number;
  taxFreeAmount: number;
  refundableAmount: number;
  cancelStatus: string; // "DONE"
  cancelRequestId: string | null;
}

/**
 * Payment 객체 내 easyPay 필드
 */
export interface ITossEasyPay {
  provider: string;
  amount: number;
  discountAmount: number;
}

/**
 * 에러/실패 객체
 */
export interface ITossFailure {
  code: string;
  message: string;
}

// ===============================
// API 결과 타입 (편의용)
// ===============================
export type IBillingCardIssueResult = IApiResult<IBillingCardData>;
export type IBillingCardListResult = IApiResult<IBillingCardListData>;
export type IBillingPrimaryResult = IApiResult<IBillingCardData>;
export type IBillingSubscribeResult = IApiResult<IBillingSubscribeData>;
export type IBillingPayResult = IApiResult<IBillingPayData>;
export type IBillingUnsubscribeResult = IApiResult<IBillingUnsubscribeData>;
export type IBillingSubscriptionResult =
  IApiResult<IBillingSubscriptionData | null>;
export type ICronBillingResult = IApiResult<ICronBillingData>;
export type ICronRetryResult = IApiResult<ICronRetryData>;
