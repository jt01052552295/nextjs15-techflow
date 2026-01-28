/**
 * 구독 정보 조회 API (DB 연동 버전)
 * GET /api/v1/payments/subscriptions/me
 */
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import { ISubscriptionResult, PLANS, PlanId } from '@/types_api/payment';

export async function GET() {
  try {
    // 인증 확인
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<ISubscriptionResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    // DB에서 활성 구독 조회
    const subscription = await prisma.shopSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
        isUse: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 구독 없음
    if (!subscription) {
      return NextResponse.json<ISubscriptionResult>(
        {
          success: true,
          code: API_CODE.SUCCESS.NO_SUBSCRIPTION,
          data: null,
        },
        { status: 200 },
      );
    }

    // 만료 여부 확인
    const now = new Date();
    if (subscription.endDate && now > subscription.endDate) {
      // 만료된 구독 상태 업데이트
      await prisma.shopSubscription.update({
        where: { idx: subscription.idx },
        data: { status: 'expired' },
      });

      return NextResponse.json<ISubscriptionResult>(
        {
          success: true,
          code: API_CODE.SUCCESS.NO_SUBSCRIPTION,
          data: null,
        },
        { status: 200 },
      );
    }

    const planId = subscription.gubun as PlanId;
    const plan = PLANS[planId] || { planName: subscription.gubun };

    return NextResponse.json<ISubscriptionResult>(
      {
        success: true,
        code: API_CODE.SUCCESS.SUBSCRIPTION_FETCHED,
        data: {
          planId: planId,
          planName: plan.planName,
          status: subscription.status as 'active' | 'cancelled',
          startedAt: subscription.startDate?.toISOString() || '',
          expiresAt: subscription.endDate?.toISOString() || '',
          autoRenew: subscription.status === 'active',
          paymentKey: subscription.paymentId,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Fetch Subscription Error:', error);
    return NextResponse.json<ISubscriptionResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
