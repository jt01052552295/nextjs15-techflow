/**
 * 카드 목록 조회 API
 * GET /api/v1/billing/card/list
 */
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import { IBillingCardListResult } from '@/types_api/billing';

export async function GET() {
  try {
    // 인증 확인
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IBillingCardListResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    // 사용자의 카드 목록 조회
    const cards = await prisma.userPayment.findMany({
      where: {
        userId: user.id,
        isUse: true,
        isVisible: true,
      },
      orderBy: [
        { isRepresent: 'desc' }, // 대표카드 우선
        { createdAt: 'desc' },
      ],
    });

    const cardList = cards.map((card) => ({
      uid: card.uid,
      cardName: card.cardName,
      cardNumber: `${card.cardNumber1}****${card.cardNumber4}`,
      isRepresent: card.isRepresent,
      createdAt: card.createdAt.toISOString(),
    }));

    return NextResponse.json<IBillingCardListResult>({
      success: true,
      code: API_CODE.SUCCESS.CARD_LIST_FETCHED,
      data: cardList,
    });
  } catch (error) {
    console.error('Card list fetch error:', error);
    return NextResponse.json<IBillingCardListResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '카드 목록 조회 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
