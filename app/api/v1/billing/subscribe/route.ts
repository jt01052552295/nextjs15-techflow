/**
 * 정기결제 구독 시작 API
 * POST /api/v1/billing/subscribe
 */
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { payWithBillingKey } from '@/lib/tosspay-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import {
  IBillingSubscribeRequest,
  IBillingSubscribeResult,
  PLANS,
  PlanId,
} from '@/types_api/billing';

/**
 * 다음 결제일 계산 (1개월 후)
 */
function getNextPaymentDate(): Date {
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  return next;
}

/**
 * 구독 orderId 생성
 */
function generateOrderId(planId: PlanId): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `billing_${planId}_${timestamp}_${random}`;
}

export async function POST(request: Request) {
  try {
    // 인증 확인
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IBillingSubscribeResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as IBillingSubscribeRequest;
    const { planId } = body;

    // 필수 필드 검증
    if (!planId || !PLANS[planId]) {
      return NextResponse.json<IBillingSubscribeResult>(
        {
          success: false,
          code: API_CODE.ERROR.INVALID_REQUEST,
          message: '유효하지 않은 planId입니다.',
        },
        { status: 400 },
      );
    }

    // 이미 활성 구독이 있는지 확인
    const existingSubscription = await prisma.shopSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
    });

    if (existingSubscription) {
      return NextResponse.json<IBillingSubscribeResult>(
        {
          success: false,
          code: API_CODE.ERROR.ACTIVE_SUBSCRIPTION_EXISTS,
          message: '이미 활성화된 구독이 있습니다.',
        },
        { status: 400 },
      );
    }

    // 대표 결제수단 확인
    const primaryCard = await prisma.userPayment.findFirst({
      where: {
        userId: user.id,
        isRepresent: true,
        isUse: true,
      },
    });

    if (!primaryCard || !primaryCard.billingKey) {
      return NextResponse.json<IBillingSubscribeResult>(
        {
          success: false,
          code: API_CODE.ERROR.NO_PRIMARY_CARD,
          message: '대표 결제수단이 설정되지 않았습니다.',
        },
        { status: 400 },
      );
    }

    const plan = PLANS[planId];
    const orderId = generateOrderId(planId);
    const orderName = `${plan.planName} 월 구독`;

    // TossPay 빌링 결제 API 호출 (첫 결제)
    const result = await payWithBillingKey(
      primaryCard.billingKey,
      user.id,
      plan.price,
      orderId,
      orderName,
    );

    if (!result.success) {
      console.error('TossPay billing payment failed:', result.error);
      return NextResponse.json<IBillingSubscribeResult>(
        {
          success: false,
          code: API_CODE.ERROR.BILLING_PAYMENT_FAILED,
          message: result.error.message || '결제에 실패했습니다.',
        },
        { status: 400 },
      );
    }

    const { paymentKey, approvedAt } = result.data;
    const now = new Date();
    const nextPaymentDate = getNextPaymentDate();

    // 주문 마스터 생성 (ShopOrder)
    const shopOrder = await prisma.shopOrder.create({
      data: {
        ordNo: orderId,
        userId: user.id,
        userIdx: user.idx || 0,
        payPrice: plan.price,
        basicPrice: plan.price,
        paymethod: 'billing',
        orderPaid: 'paid',
        orderStatus: 'paid',
        gubun: 'subscription',
      },
    });

    // 결제 정보 저장 (ShopOrderPayment)
    await prisma.shopOrderPayment.create({
      data: {
        orderId: shopOrder.idx,
        merchantUid: orderId,
        impUid: paymentKey,
        amount: plan.price,
        paidAmount: plan.price,
        status: 'paid',
        payMethod: 'billing',
        paidAt: Math.floor(new Date(approvedAt).getTime() / 1000),
      },
    });

    // 구독 정보 생성 (ShopSubscription)
    const subscription = await prisma.shopSubscription.create({
      data: {
        ordNo: orderId,
        paymentId: paymentKey,
        orderId: shopOrder.idx,
        userId: user.id,
        userIdx: user.idx || 0,
        gubun: planId,
        status: 'active',
        startDate: now,
        endDate: nextPaymentDate,
        userPaymentId: primaryCard.idx,
        nextPaymentAt: nextPaymentDate,
        lastPaymentAt: now,
        retryCount: 0,
      },
    });

    return NextResponse.json<IBillingSubscribeResult>({
      success: true,
      code: API_CODE.SUCCESS.SUBSCRIPTION_STARTED,
      data: {
        subscriptionUid: subscription.uid,
        planId,
        planName: plan.planName,
        status: 'active',
        startedAt: now.toISOString(),
        nextPaymentDate: nextPaymentDate.toISOString(),
        paymentKey,
      },
    });
  } catch (error) {
    console.error('Subscription start error:', error);
    return NextResponse.json<IBillingSubscribeResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '구독 시작 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
