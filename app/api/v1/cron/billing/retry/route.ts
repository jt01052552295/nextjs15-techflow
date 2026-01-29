/**
 * 결제 실패 재시도 Cron API
 * GET /api/v1/cron/billing/retry
 *
 * Crontab에서 매일 오전 9시 30분에 호출
 * 최대 3회까지 재시도, 이후 구독 일시정지
 */
import { NextResponse } from 'next/server';
import { payWithBillingKey } from '@/lib/tosspay-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import { ICronRetryResult, PLANS, PlanId } from '@/types_api/billing';

const CRON_SECRET = process.env.CRON_SECRET || '';
const MAX_RETRY_COUNT = 3;

/**
 * 다음 결제일 계산 (1개월 후)
 */
function getNextPaymentDate(): Date {
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  return next;
}

/**
 * 결제 orderId 생성
 */
function generateOrderId(planId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `billing_retry_${planId}_${timestamp}_${random}`;
}

export async function GET(request: Request) {
  try {
    // Cron 인증 확인
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!CRON_SECRET || token !== CRON_SECRET) {
      return NextResponse.json<ICronRetryResult>(
        {
          success: false,
          code: API_CODE.ERROR.CRON_UNAUTHORIZED,
          message: '인증되지 않은 요청입니다.',
        },
        { status: 401 },
      );
    }

    const now = new Date();

    // 결제 실패한 구독 중 재시도 가능한 것 조회 (retryCount < MAX_RETRY_COUNT)
    const failedSubscriptions = await prisma.shopSubscription.findMany({
      where: {
        status: 'active',
        failedAt: { not: null },
        retryCount: { lt: MAX_RETRY_COUNT },
      },
      include: {
        UserPayment: true,
      },
    });

    const results = {
      retried: failedSubscriptions.length,
      succeeded: 0,
      failed: 0,
    };

    for (const subscription of failedSubscriptions) {
      const card = subscription.UserPayment;
      const planId = subscription.gubun as PlanId;
      const plan = PLANS[planId];

      // 카드나 빌링키가 없으면 실패 처리
      if (!card || !card.billingKey || !plan) {
        await prisma.shopSubscription.update({
          where: { idx: subscription.idx },
          data: {
            retryCount: { increment: 1 },
            failedAt: now,
          },
        });

        // 최대 재시도 횟수 도달 시 일시정지
        if (subscription.retryCount + 1 >= MAX_RETRY_COUNT) {
          await prisma.shopSubscription.update({
            where: { idx: subscription.idx },
            data: { status: 'paused' },
          });
        }

        results.failed++;
        continue;
      }

      const orderId = generateOrderId(planId);
      const orderName = `${plan.planName} 월 구독 (재시도)`;

      // TossPay 빌링 결제 재시도
      const result = await payWithBillingKey(
        card.billingKey,
        subscription.userId || '',
        plan.price,
        orderId,
        orderName,
      );

      if (result.success) {
        const { paymentKey, approvedAt } = result.data;
        const nextPaymentDate = getNextPaymentDate();

        // 주문 생성
        const shopOrder = await prisma.shopOrder.create({
          data: {
            ordNo: orderId,
            userId: subscription.userId,
            userIdx: subscription.userIdx,
            payPrice: plan.price,
            basicPrice: plan.price,
            paymethod: 'billing',
            orderPaid: 'paid',
            orderStatus: 'paid',
            gubun: 'subscription_retry',
          },
        });

        // 결제 정보 저장
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

        // 구독 정보 갱신 (성공)
        await prisma.shopSubscription.update({
          where: { idx: subscription.idx },
          data: {
            endDate: nextPaymentDate,
            nextPaymentAt: nextPaymentDate,
            lastPaymentAt: now,
            retryCount: 0,
            failedAt: null,
          },
        });

        results.succeeded++;
      } else {
        console.error(`Retry failed for ${subscription.uid}:`, result.error);

        const newRetryCount = subscription.retryCount + 1;

        await prisma.shopSubscription.update({
          where: { idx: subscription.idx },
          data: {
            retryCount: newRetryCount,
            failedAt: now,
            // 최대 재시도 횟수 도달 시 일시정지
            ...(newRetryCount >= MAX_RETRY_COUNT && { status: 'paused' }),
          },
        });

        results.failed++;
      }
    }

    console.log(`Cron retry completed:`, results);

    return NextResponse.json<ICronRetryResult>({
      success: true,
      code: API_CODE.SUCCESS.CRON_RETRY_COMPLETED,
      data: results,
    });
  } catch (error) {
    console.error('Cron retry error:', error);
    return NextResponse.json<ICronRetryResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '재시도 실행 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
