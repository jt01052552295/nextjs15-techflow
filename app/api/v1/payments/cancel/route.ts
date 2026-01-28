/**
 * 결제 취소 (환불) API (DB 연동 버전)
 * POST /api/v1/payments/cancel
 */
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { cancelPayment } from '@/lib/tosspay-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import {
  IPaymentCancelRequest,
  IPaymentCancelResult,
} from '@/types_api/payment';

export async function POST(request: Request) {
  try {
    // 인증 확인
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IPaymentCancelResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as IPaymentCancelRequest;
    const { paymentKey, cancelReason, cancelAmount } = body;

    // 필수 필드 검증
    if (!paymentKey || !cancelReason) {
      return NextResponse.json<IPaymentCancelResult>(
        {
          success: false,
          code: API_CODE.ERROR.MISSING_FIELDS,
          message: 'paymentKey와 cancelReason은 필수입니다.',
        },
        { status: 400 },
      );
    }

    // DB에서 결제 정보 조회
    const payment = await prisma.shopOrderPayment.findFirst({
      where: {
        OR: [{ pgTid: paymentKey }, { applyNum: paymentKey }],
        status: 'paid',
      },
      include: {
        ShopOrder: true,
      },
    });

    if (!payment) {
      return NextResponse.json<IPaymentCancelResult>(
        {
          success: false,
          code: API_CODE.ERROR.PAYMENT_NOT_FOUND,
          message: '결제 정보를 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    // 본인 결제인지 확인
    if (payment.ShopOrder.userId !== user.id) {
      return NextResponse.json<IPaymentCancelResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '본인의 결제만 취소할 수 있습니다.',
        },
        { status: 403 },
      );
    }

    // TossPay 결제 취소 API 호출
    const result = await cancelPayment(paymentKey, cancelReason, cancelAmount);

    if (!result.success) {
      console.error('TossPay cancel error:', result.error);
      return NextResponse.json<IPaymentCancelResult>(
        {
          success: false,
          code: API_CODE.ERROR.PAYMENT_CANCEL_FAILED,
          message: result.error.message || '결제 취소에 실패했습니다.',
        },
        { status: 400 },
      );
    }

    const cancelInfo = result.data.cancels?.[0];
    const now = new Date();

    // DB 트랜잭션으로 결제 상태 + 구독 상태 업데이트
    await prisma.$transaction(async (tx) => {
      // 1. 결제 상태 업데이트
      await tx.shopOrderPayment.update({
        where: { idx: payment.idx },
        data: {
          status: 'cancelled',
          cancelAmount: cancelInfo?.cancelAmount || payment.paidAmount,
          cancelledAt: Math.floor(now.getTime() / 1000),
        },
      });

      // 2. 주문 상태 업데이트
      await tx.shopOrder.update({
        where: { idx: payment.orderId },
        data: {
          orderPaid: 'cancelled',
          cancelStatus: 'completed',
          cancelReasonText: cancelReason,
          cancelRequestedAt: now,
        },
      });

      // 3. 관련 구독 취소
      await tx.shopSubscription.updateMany({
        where: {
          paymentId: paymentKey,
          status: 'active',
        },
        data: {
          status: 'cancelled',
          endDate: now,
        },
      });
    });

    return NextResponse.json<IPaymentCancelResult>(
      {
        success: true,
        code: API_CODE.SUCCESS.PAYMENT_CANCELLED,
        data: {
          paymentKey: result.data.paymentKey,
          orderId: result.data.orderId,
          status: result.data.status,
          cancelAmount: cancelInfo?.cancelAmount || 0,
          cancelReason: cancelInfo?.cancelReason || cancelReason,
          canceledAt: cancelInfo?.canceledAt || now.toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Payment Cancel Error:', error);
    return NextResponse.json<IPaymentCancelResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
