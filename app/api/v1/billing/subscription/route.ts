/**
 * 구독 정보 조회 API
 * GET /api/v1/billing/subscription
 */
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import { IBillingSubscriptionResult, PLANS, PlanId } from '@/types_api/billing';

export async function GET() {
  try {
    // 인증 확인
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IBillingSubscriptionResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    // 구독 정보 조회 (가장 최근 구독)
    const subscription = await prisma.shopSubscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['active', 'cancelled', 'paused'] },
      },
      include: {
        UserPayment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return NextResponse.json<IBillingSubscriptionResult>({
        success: true,
        code: API_CODE.SUCCESS.NO_SUBSCRIPTION,
        data: null,
      });
    }

    const planId = subscription.gubun as PlanId;
    const plan = PLANS[planId] || { planName: subscription.gubun };
    const card = subscription.UserPayment;

    return NextResponse.json<IBillingSubscriptionResult>({
      success: true,
      code: API_CODE.SUCCESS.SUBSCRIPTION_INFO_FETCHED,
      data: {
        subscriptionUid: subscription.uid,
        planId,
        planName: plan.planName || subscription.gubun,
        status: subscription.status as any,
        startedAt:
          subscription.startDate?.toISOString() ||
          subscription.createdAt.toISOString(),
        expiresAt: subscription.endDate?.toISOString() || '',
        nextPaymentDate: subscription.nextPaymentAt?.toISOString() || null,
        cardUid: card?.uid || null,
        cardName: card?.cardName || null,
        cardNumber: card ? `${card.cardNumber1}****${card.cardNumber4}` : null,
      },
    });
  } catch (error) {
    console.error('Subscription info fetch error:', error);
    return NextResponse.json<IBillingSubscriptionResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '구독 정보 조회 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
