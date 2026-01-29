/**
 * 대표 결제수단 설정/해제 API
 * POST /api/v1/billing/card/primary - 대표카드 설정
 * DELETE /api/v1/billing/card/primary - 대표카드 해제
 */
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import {
  IBillingPrimaryRequest,
  IBillingPrimaryResult,
} from '@/types_api/billing';
import { IApiResult } from '@/types_api/user/settings';

export async function POST(request: Request) {
  try {
    // 인증 확인
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IBillingPrimaryResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as IBillingPrimaryRequest;
    const { cardUid } = body;

    // 필수 필드 검증
    if (!cardUid) {
      return NextResponse.json<IBillingPrimaryResult>(
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
      return NextResponse.json<IBillingPrimaryResult>(
        {
          success: false,
          code: API_CODE.ERROR.CARD_NOT_FOUND,
          message: '카드를 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    // 트랜잭션: 기존 대표카드 해제 → 새 대표카드 설정
    await prisma.$transaction([
      // 기존 대표카드 해제
      prisma.userPayment.updateMany({
        where: {
          userId: user.id,
          isRepresent: true,
        },
        data: {
          isRepresent: false,
        },
      }),
      // 새 대표카드 설정
      prisma.userPayment.update({
        where: { idx: card.idx },
        data: { isRepresent: true },
      }),
    ]);

    return NextResponse.json<IBillingPrimaryResult>({
      success: true,
      code: API_CODE.SUCCESS.PRIMARY_CARD_SET,
      data: {
        uid: card.uid,
        cardName: card.cardName,
        cardNumber: `${card.cardNumber1}****${card.cardNumber4}`,
        isRepresent: true,
        createdAt: card.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Primary card set error:', error);
    return NextResponse.json<IBillingPrimaryResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '대표 결제수단 설정 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
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

    // 모든 대표카드 해제
    await prisma.userPayment.updateMany({
      where: {
        userId: user.id,
        isRepresent: true,
      },
      data: {
        isRepresent: false,
      },
    });

    return NextResponse.json<IApiResult<null>>({
      success: true,
      code: API_CODE.SUCCESS.PRIMARY_CARD_UNSET,
      message: '대표 결제수단이 해제되었습니다.',
    });
  } catch (error) {
    console.error('Primary card unset error:', error);
    return NextResponse.json<IApiResult<null>>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '대표 결제수단 해제 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
