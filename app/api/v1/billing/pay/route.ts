/**
 * 빌링키로 즉시 결제 API
 * POST /api/v1/billing/pay
 */
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { payWithBillingKey } from '@/lib/tosspay-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import { IBillingPayRequest, IBillingPayResult } from '@/types_api/billing';

/**
 * 결제 orderId 생성
 */
function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `billing_pay_${timestamp}_${random}`;
}

export async function POST(request: Request) {
  try {
    // 인증 확인
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IBillingPayResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as IBillingPayRequest;
    const { cardUid, amount, orderName } = body;

    // 필수 필드 검증
    if (!cardUid || !amount || !orderName) {
      return NextResponse.json<IBillingPayResult>(
        {
          success: false,
          code: API_CODE.ERROR.MISSING_FIELDS,
          message: 'cardUid, amount, orderName은 필수입니다.',
        },
        { status: 400 },
      );
    }

    // 카드 확인
    const card = await prisma.userPayment.findFirst({
      where: {
        uid: cardUid,
        userId: user.id,
        isUse: true,
      },
    });

    if (!card || !card.billingKey) {
      return NextResponse.json<IBillingPayResult>(
        {
          success: false,
          code: API_CODE.ERROR.CARD_NOT_FOUND,
          message: '카드를 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    const orderId = generateOrderId();

    // TossPay 빌링 결제 API 호출
    const result = await payWithBillingKey(
      card.billingKey,
      user.id,
      amount,
      orderId,
      orderName,
    );

    if (!result.success) {
      console.error('TossPay billing payment failed:', result.error);
      return NextResponse.json<IBillingPayResult>(
        {
          success: false,
          code: API_CODE.ERROR.BILLING_PAYMENT_FAILED,
          message: result.error.message || '결제에 실패했습니다.',
        },
        { status: 400 },
      );
    }

    const { paymentKey, approvedAt } = result.data;

    // 주문 및 결제 정보 저장
    const shopOrder = await prisma.shopOrder.create({
      data: {
        ordNo: orderId,
        userId: user.id,
        userIdx: user.idx || 0,
        payPrice: amount,
        basicPrice: amount,
        paymethod: 'billing',
        orderPaid: 'paid',
        orderStatus: 'paid',
        gubun: 'billing_pay',
      },
    });

    await prisma.shopOrderPayment.create({
      data: {
        orderId: shopOrder.idx,
        merchantUid: orderId,
        impUid: paymentKey,
        amount,
        paidAmount: amount,
        status: 'paid',
        payMethod: 'billing',
        paidAt: Math.floor(new Date(approvedAt).getTime() / 1000),
      },
    });

    return NextResponse.json<IBillingPayResult>({
      success: true,
      code: API_CODE.SUCCESS.BILLING_PAYMENT_SUCCESS,
      data: {
        paymentKey,
        orderId,
        amount,
        approvedAt,
      },
    });
  } catch (error) {
    console.error('Billing pay error:', error);
    return NextResponse.json<IBillingPayResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '결제 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
