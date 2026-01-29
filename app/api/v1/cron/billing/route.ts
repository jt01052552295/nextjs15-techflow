/**
 * 자동결제 실행 Cron API
 * GET /api/v1/cron/billing
 *
 * Crontab에서 매일 오전 9시에 호출
 */
import { NextResponse } from 'next/server';
import { payWithBillingKey } from '@/lib/tosspay-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import { ICronBillingResult, PLANS, PlanId } from '@/types_api/billing';

const CRON_SECRET = process.env.CRON_SECRET || '';

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
  return `billing_auto_${planId}_${timestamp}_${random}`;
}

export async function GET(request: Request) {
  try {
    // Cron 인증 확인
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!CRON_SECRET || token !== CRON_SECRET) {
      return NextResponse.json<ICronBillingResult>(
        {
          success: false,
          code: API_CODE.ERROR.CRON_UNAUTHORIZED,
          message: '인증되지 않은 요청입니다.',
        },
        { status: 401 },
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 오늘 결제 예정인 활성 구독 조회
    const subscriptions = await prisma.shopSubscription.findMany({
      where: {
        status: 'active',
        nextPaymentAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        UserPayment: true,
        User: true,
      },
    });

    const results = {
      processed: subscriptions.length,
      succeeded: 0,
      failed: 0,
      failedSubscriptions: [] as string[],
    };

    for (const subscription of subscriptions) {
      const card = subscription.UserPayment;
      const planId = subscription.gubun as PlanId;
      const plan = PLANS[planId];

      // 카드나 빌링키가 없으면 실패 처리
      if (!card || !card.billingKey) {
        results.failed++;
        results.failedSubscriptions.push(subscription.uid);

        await prisma.shopSubscription.update({
          where: { idx: subscription.idx },
          data: {
            retryCount: { increment: 1 },
            failedAt: now,
          },
        });
        continue;
      }

      // 플랜 정보가 없으면 스킵
      if (!plan) {
        console.error(
          `Unknown plan: ${planId} for subscription ${subscription.uid}`,
        );
        results.failed++;
        results.failedSubscriptions.push(subscription.uid);
        continue;
      }

      const orderId = generateOrderId(planId);
      const orderName = `${plan.planName} 월 구독 (자동결제)`;

      // TossPay 빌링 결제 실행
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
            gubun: 'subscription_renewal',
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

        // 구독 정보 갱신
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
        console.error(`Billing failed for ${subscription.uid}:`, result.error);

        await prisma.shopSubscription.update({
          where: { idx: subscription.idx },
          data: {
            retryCount: { increment: 1 },
            failedAt: now,
          },
        });

        results.failed++;
        results.failedSubscriptions.push(subscription.uid);
      }
    }

    console.log(`Cron billing completed:`, results);

    return NextResponse.json<ICronBillingResult>({
      success: true,
      code: API_CODE.SUCCESS.CRON_BILLING_COMPLETED,
      data: results,
    });
  } catch (error) {
    console.error('Cron billing error:', error);
    return NextResponse.json<ICronBillingResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '자동결제 실행 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
