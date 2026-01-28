/**
 * TossPay API 유틸리티
 * 경로: /lib/tosspay-utils.ts
 */

import {
  ITossPaymentConfirmResponse,
  ITossPaymentCancelResponse,
  ITossErrorResponse,
} from '@/types_api/payment';

const TOSS_API_URL = 'https://api.tosspayments.com/v1';

/**
 * TossPay API 인증 헤더 생성
 */
function getAuthHeader(): string {
  const secretKey = process.env.TOSSPAYMENT_SECRET_KEY || '';
  const encoded = Buffer.from(secretKey + ':').toString('base64');
  return `Basic ${encoded}`;
}

/**
 * TossPay API 요청 공통 헤더
 */
function getHeaders(): HeadersInit {
  return {
    Authorization: getAuthHeader(),
    'Content-Type': 'application/json',
  };
}

/**
 * 결제 승인 API 호출
 * POST https://api.tosspayments.com/v1/payments/confirm
 */
export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<
  | { success: true; data: ITossPaymentConfirmResponse }
  | { success: false; error: ITossErrorResponse }
> {
  try {
    const response = await fetch(`${TOSS_API_URL}/payments/confirm`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data as ITossErrorResponse,
      };
    }

    return {
      success: true,
      data: data as ITossPaymentConfirmResponse,
    };
  } catch (error) {
    console.error('TossPay confirmPayment error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '결제 승인 요청 중 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * 결제 취소 API 호출
 * POST https://api.tosspayments.com/v1/payments/{paymentKey}/cancel
 */
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number,
): Promise<
  | { success: true; data: ITossPaymentCancelResponse }
  | { success: false; error: ITossErrorResponse }
> {
  try {
    const body: Record<string, any> = { cancelReason };
    if (cancelAmount !== undefined) {
      body.cancelAmount = cancelAmount;
    }

    const response = await fetch(
      `${TOSS_API_URL}/payments/${paymentKey}/cancel`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data as ITossErrorResponse,
      };
    }

    return {
      success: true,
      data: data as ITossPaymentCancelResponse,
    };
  } catch (error) {
    console.error('TossPay cancelPayment error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '결제 취소 요청 중 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * 결제 조회 API 호출
 * GET https://api.tosspayments.com/v1/payments/{paymentKey}
 */
export async function getPayment(
  paymentKey: string,
): Promise<
  | { success: true; data: ITossPaymentConfirmResponse }
  | { success: false; error: ITossErrorResponse }
> {
  try {
    const response = await fetch(`${TOSS_API_URL}/payments/${paymentKey}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data as ITossErrorResponse,
      };
    }

    return {
      success: true,
      data: data as ITossPaymentConfirmResponse,
    };
  } catch (error) {
    console.error('TossPay getPayment error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '결제 조회 요청 중 오류가 발생했습니다.',
      },
    };
  }
}
