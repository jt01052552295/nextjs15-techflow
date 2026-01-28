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
  status: string;
  totalAmount: number;
  approvedAt: string;
  method?: string;
  card?: {
    company: string;
    number: string;
    installmentPlanMonths: number;
  };
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
// TossPay API 응답 타입
// ===============================
export interface ITossPaymentConfirmResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  approvedAt: string;
  card?: {
    company: string;
    number: string;
    installmentPlanMonths: number;
  };
}

export interface ITossPaymentCancelResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  cancels: Array<{
    cancelAmount: number;
    cancelReason: string;
    canceledAt: string;
  }>;
}

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
