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

// ===============================
// 빌링 API (자동결제)
// ===============================

import {
  ITossBillingKeyResponse,
  ITossBillingPaymentResponse,
} from '@/types_api/billing';

/**
 * 빌링키 발급 API 호출
 * POST https://api.tosspayments.com/v1/billing/authorizations/issue
 */
export async function issueBillingKey(
  authKey: string,
  customerKey: string,
): Promise<
  | { success: true; data: ITossBillingKeyResponse }
  | { success: false; error: ITossErrorResponse }
> {
  try {
    const response = await fetch(
      `${TOSS_API_URL}/billing/authorizations/issue`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          authKey,
          customerKey,
        }),
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
      data: data as ITossBillingKeyResponse,
    };
  } catch (error) {
    console.error('TossPay issueBillingKey error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '빌링키 발급 요청 중 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * 빌링키로 결제 API 호출
 * POST https://api.tosspayments.com/v1/billing/{billingKey}
 */
export async function payWithBillingKey(
  billingKey: string,
  customerKey: string,
  amount: number,
  orderId: string,
  orderName: string,
): Promise<
  | { success: true; data: ITossBillingPaymentResponse }
  | { success: false; error: ITossErrorResponse }
> {
  try {
    const response = await fetch(`${TOSS_API_URL}/billing/${billingKey}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        customerKey,
        amount,
        orderId,
        orderName,
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
      data: data as ITossBillingPaymentResponse,
    };
  } catch (error) {
    console.error('TossPay payWithBillingKey error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '빌링 결제 요청 중 오류가 발생했습니다.',
      },
    };
  }
}

/**
 * 빌링키 삭제 API 호출
 * DELETE https://api.tosspayments.com/v1/billing/{billingKey}
 */
export async function deleteBillingKey(
  billingKey: string,
): Promise<{ success: true } | { success: false; error: ITossErrorResponse }> {
  try {
    const response = await fetch(`${TOSS_API_URL}/billing/${billingKey}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    // 성공 시 200 응답 (빈 body)
    if (response.ok) {
      return { success: true };
    }

    // 실패 시 에러 객체 반환
    const data = await response.json();
    return {
      success: false,
      error: data as ITossErrorResponse,
    };
  } catch (error) {
    console.error('TossPay deleteBillingKey error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: '빌링키 삭제 요청 중 오류가 발생했습니다.',
      },
    };
  }
}
