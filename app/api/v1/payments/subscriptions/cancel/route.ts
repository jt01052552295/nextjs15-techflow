/**
 * 구독 취소 API (DB 연동 버전)
 * POST /api/v1/payments/subscriptions/cancel
 *
 * 자동 결제 해지 (구독 만료일까지는 사용 가능)
 */
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import { ISubscriptionCancelResult, PlanId } from '@/types_api/payment';

export async function POST() {
  try {
    // 인증 확인
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<ISubscriptionCancelResult>(
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

    if (!subscription) {
      return NextResponse.json<ISubscriptionCancelResult>(
        {
          success: false,
          code: API_CODE.ERROR.SUBSCRIPTION_NOT_FOUND,
          message: '구독 정보를 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    // 구독 취소 처리 (자동 갱신 해제, 만료일까지는 사용 가능)
    await prisma.shopSubscription.update({
      where: { idx: subscription.idx },
      data: {
        status: 'cancelled',
      },
    });

    const planId = subscription.gubun as PlanId;

    return NextResponse.json<ISubscriptionCancelResult>(
      {
        success: true,
        code: API_CODE.SUCCESS.SUBSCRIPTION_CANCELLED,
        data: {
          planId: planId,
          status: 'cancelled',
          expiresAt: subscription.endDate?.toISOString() || '',
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Cancel Subscription Error:', error);
    return NextResponse.json<ISubscriptionCancelResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
