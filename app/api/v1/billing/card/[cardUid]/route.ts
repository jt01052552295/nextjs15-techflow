/**
 * 카드 삭제 API
 * DELETE /api/v1/billing/card/[cardUid]
 */
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { deleteBillingKey } from '@/lib/tosspay-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import { IApiResult } from '@/types_api/user/settings';

interface RouteParams {
  params: Promise<{ cardUid: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // 인증 확인
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    const { cardUid } = await params;

    if (!cardUid) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.MISSING_FIELDS,
          message: 'cardUid는 필수입니다.',
        },
        { status: 400 },
      );
    }

    // 해당 카드 확인
    const card = await prisma.userPayment.findFirst({
      where: {
        uid: cardUid,
        userId: user.id,
        isUse: true,
      },
    });

    if (!card) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.CARD_NOT_FOUND,
          message: '카드를 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    // 해당 카드가 활성 구독에 연결되어 있는지 확인
    const activeSubscription = await prisma.shopSubscription.findFirst({
      where: {
        userPaymentId: card.idx,
        status: 'active',
      },
    });

    if (activeSubscription) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.INVALID_REQUEST,
          message:
            '활성 구독에 연결된 카드는 삭제할 수 없습니다. 먼저 구독을 해지하거나 다른 카드를 대표카드로 설정하세요.',
        },
        { status: 400 },
      );
    }

    // TossPay 빌링키 삭제 API 호출
    if (card.billingKey) {
      const deleteResult = await deleteBillingKey(card.billingKey);

      if (!deleteResult.success) {
        console.error('TossPay billingKey delete failed:', deleteResult.error);
        // 토스페이 삭제 실패해도 로컬 DB에서는 삭제 진행 (billingKey 무효화)
        // 필요시 여기서 에러 반환 가능
      }
    }

    // 카드 삭제 (소프트 삭제)
    await prisma.userPayment.update({
      where: { idx: card.idx },
      data: {
        isUse: false,
        isVisible: false,
        isRepresent: false,
      },
    });

    // 삭제된 카드가 대표카드였으면, 다른 카드 중 하나를 대표카드로 설정
    if (card.isRepresent) {
      const anotherCard = await prisma.userPayment.findFirst({
        where: {
          userId: user.id,
          isUse: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (anotherCard) {
        await prisma.userPayment.update({
          where: { idx: anotherCard.idx },
          data: { isRepresent: true },
        });
      }
    }

    return NextResponse.json<IApiResult<null>>({
      success: true,
      code: API_CODE.SUCCESS.CARD_DELETED,
      message: '카드가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Card delete error:', error);
    return NextResponse.json<IApiResult<null>>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '카드 삭제 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
