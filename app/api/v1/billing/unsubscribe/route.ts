/**
 * 정기결제 해지 API
 * POST /api/v1/billing/unsubscribe
 */
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import { IBillingUnsubscribeResult, PlanId } from '@/types_api/billing';

export async function POST() {
  try {
    // 인증 확인
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IBillingUnsubscribeResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    // 활성 구독 확인
    const subscription = await prisma.shopSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
    });

    if (!subscription) {
      return NextResponse.json<IBillingUnsubscribeResult>(
        {
          success: false,
          code: API_CODE.ERROR.NO_ACTIVE_SUBSCRIPTION,
          message: '활성화된 구독이 없습니다.',
        },
        { status: 404 },
      );
    }

    // 구독 해지 (cancelled 상태로 변경, 다음 결제 예정일은 null로)
    await prisma.shopSubscription.update({
      where: { idx: subscription.idx },
      data: {
        status: 'cancelled',
        nextPaymentAt: null,
      },
    });

    const planId = subscription.gubun as PlanId;
    const expiresAt = subscription.endDate || subscription.nextPaymentAt;

    return NextResponse.json<IBillingUnsubscribeResult>({
      success: true,
      code: API_CODE.SUCCESS.SUBSCRIPTION_UNSUBSCRIBED,
      data: {
        planId,
        status: 'cancelled',
        expiresAt: expiresAt?.toISOString() || new Date().toISOString(),
        message: '다음 결제일까지 서비스를 이용할 수 있습니다.',
      },
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json<IBillingUnsubscribeResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '구독 해지 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
