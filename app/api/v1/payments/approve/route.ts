/**
 * 결제 승인 API (DB 연동 버전)
 * POST /api/v1/payments/approve
 */
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { confirmPayment } from '@/lib/tosspay-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import {
  IPaymentApproveRequest,
  IPaymentApproveResult,
  PLANS,
  PlanId,
} from '@/types_api/payment';

/**
 * orderId에서 planId 추출
 * 예: "order_premium_1706428800000_abc123" → "premium"
 */
function extractPlanIdFromOrderId(orderId: string): PlanId | null {
  const parts = orderId.split('_');
  if (parts.length >= 2) {
    const planId = parts[1] as PlanId;
    if (PLANS[planId]) {
      return planId;
    }
  }
  return null;
}

/**
 * 결제 금액 검증
 */
function validateAmount(planId: PlanId, amount: number): boolean {
  const plan = PLANS[planId];
  return plan && plan.price === amount;
}

export async function POST(request: Request) {
  try {
    // 인증 확인
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IPaymentApproveResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as IPaymentApproveRequest;
    const { paymentKey, orderId, amount } = body;

    // 필수 필드 검증
    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json<IPaymentApproveResult>(
        {
          success: false,
          code: API_CODE.ERROR.MISSING_FIELDS,
          message: 'paymentKey, orderId, amount는 필수입니다.',
        },
        { status: 400 },
      );
    }

    // 중복 승인 방지 - DB에서 확인
    const existingPayment = await prisma.shopOrderPayment.findFirst({
      where: {
        merchantUid: orderId,
        status: 'paid',
      },
    });

    if (existingPayment) {
      return NextResponse.json<IPaymentApproveResult>(
        {
          success: false,
          code: API_CODE.ERROR.PAYMENT_ALREADY_PROCESSED,
          message: '이미 처리된 주문입니다.',
        },
        { status: 400 },
      );
    }

    // planId 추출 및 금액 검증
    const planId = extractPlanIdFromOrderId(orderId);
    if (planId && !validateAmount(planId, amount)) {
      return NextResponse.json<IPaymentApproveResult>(
        {
          success: false,
          code: API_CODE.ERROR.PAYMENT_AMOUNT_MISMATCH,
          message: '결제 금액이 일치하지 않습니다.',
        },
        { status: 400 },
      );
    }

    // TossPay 결제 승인 API 호출
    const result = await confirmPayment(paymentKey, orderId, amount);

    if (!result.success) {
      console.error('TossPay confirm error:', result.error);
      return NextResponse.json<IPaymentApproveResult>(
        {
          success: false,
          code: API_CODE.ERROR.PAYMENT_FAILED,
          message: result.error.message || '결제 승인에 실패했습니다.',
        },
        { status: 400 },
      );
    }

    const plan = planId ? PLANS[planId] : null;
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1개월 후 만료

    // paidAt 계산 (approvedAt이 null일 수 있음)
    const paidAtTimestamp = result.data.approvedAt
      ? Math.floor(new Date(result.data.approvedAt).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    // DB 트랜잭션으로 주문 + 결제 + 구독 저장
    await prisma.$transaction(async (tx) => {
      // 1. 주문 생성
      const order = await tx.shopOrder.create({
        data: {
          ordNo: orderId,
          userId: user.id,
          gubun: 'subscription',
          basicPrice: amount,
          payPrice: amount,
          orderPaid: 'paid',
          orderStatus: 'completed',
          paymethod: result.data.method || 'card',
          name: user.name || '',
          email: user.email || '',
        },
      });

      // 2. 결제 정보 저장
      await tx.shopOrderPayment.create({
        data: {
          orderId: order.idx,
          gubun: 'subscription',
          applyNum: paymentKey,
          amount: amount,
          buyerName: user.name || '',
          buyerEmail: user.email || '',
          merchantUid: orderId,
          name: plan?.planName || 'Premium Subscription',
          paidAmount: result.data.totalAmount,
          paidAt: paidAtTimestamp,
          payMethod: result.data.method || 'card',
          pgProvider: 'tosspayments',
          pgTid: paymentKey,
          status: 'paid',
          cardName: result.data.card?.cardType || '',
          cardNumber: result.data.card?.number || '',
          cardQuota: result.data.card?.installmentPlanMonths || 0,
        },
      });

      // 3. 구독 정보 저장 (planId가 있는 경우)
      if (planId) {
        // 기존 활성 구독이 있으면 종료 처리
        await tx.shopSubscription.updateMany({
          where: {
            userId: user.id,
            status: 'active',
          },
          data: {
            status: 'expired',
            endDate: now,
          },
        });

        // 새 구독 생성
        await tx.shopSubscription.create({
          data: {
            paymentId: paymentKey,
            ordNo: orderId,
            orderId: order.idx,
            userId: user.id,
            gubun: planId,
            startDate: now,
            endDate: expiresAt,
            status: 'active',
            isUse: true,
          },
        });
      }
    });

    // 성공 응답
    return NextResponse.json<IPaymentApproveResult>(
      {
        success: true,
        code: API_CODE.SUCCESS.PAYMENT_APPROVED,
        data: {
          paymentKey: result.data.paymentKey,
          orderId: result.data.orderId,
          orderName: result.data.orderName,
          status: result.data.status,
          totalAmount: result.data.totalAmount,
          approvedAt: result.data.approvedAt ?? null,
          method: result.data.method,
          card: result.data.card ?? null,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Payment Approve Error:', error);
    return NextResponse.json<IPaymentApproveResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
