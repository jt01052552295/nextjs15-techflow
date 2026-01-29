/**
 * 빌링키 발급 (카드 등록) API
 * POST /api/v1/billing/card/issue
 */
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { issueBillingKey } from '@/lib/tosspay-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import {
  IBillingCardIssueRequest,
  IBillingCardIssueResult,
} from '@/types_api/billing';

export async function POST(request: Request) {
  try {
    // 인증 확인
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IBillingCardIssueResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as IBillingCardIssueRequest;
    const { authKey } = body;

    // 필수 필드 검증
    if (!authKey) {
      return NextResponse.json<IBillingCardIssueResult>(
        {
          success: false,
          code: API_CODE.ERROR.MISSING_FIELDS,
          message: 'authKey는 필수입니다.',
        },
        { status: 400 },
      );
    }

    // TossPay 빌링키 발급 API 호출
    const result = await issueBillingKey(authKey, user.id);

    if (!result.success) {
      console.error('TossPay billing key issue failed:', result.error);
      return NextResponse.json<IBillingCardIssueResult>(
        {
          success: false,
          code: API_CODE.ERROR.BILLING_KEY_ISSUE_FAILED,
          message: result.error.message || '빌링키 발급에 실패했습니다.',
        },
        { status: 400 },
      );
    }

    // 공식 문서 기준: cardCompany/cardNumber 또는 card 객체에서 추출
    const billingData = result.data;
    const billingKey = billingData.billingKey;
    const cardCompany =
      billingData.cardCompany || billingData.card?.issuerCode || '카드';
    const cardNumber =
      billingData.cardNumber || billingData.card?.number || '************';

    // 기존 카드가 없으면 대표카드로 설정
    const existingCards = await prisma.userPayment.count({
      where: {
        userId: user.id,
        isUse: true,
      },
    });

    const isFirstCard = existingCards === 0;

    // 카드번호 마스킹 처리 (1234****5678)
    const cardParts = cardNumber.replace(/[^0-9*]/g, '');
    const cardNumber1 = cardParts.slice(0, 4);
    const cardNumber2 = cardParts.slice(4, 8) || '****';
    const cardNumber3 = cardParts.slice(8, 12) || '****';
    const cardNumber4 = cardParts.slice(-4);

    // DB에 카드 정보 저장
    const userPayment = await prisma.userPayment.create({
      data: {
        userId: user.id,
        billingKey: billingKey,
        customerUid: user.id, // TossPay에서는 customerKey로 사용
        cardName: cardCompany,
        cardNumber1,
        cardNumber2,
        cardNumber3,
        cardNumber4,
        isRepresent: isFirstCard, // 첫 카드면 대표카드로
        isUse: true,
        isVisible: true,
      },
    });

    return NextResponse.json<IBillingCardIssueResult>({
      success: true,
      code: API_CODE.SUCCESS.BILLING_KEY_ISSUED,
      data: {
        uid: userPayment.uid,
        cardName: cardCompany,
        cardNumber: `${cardNumber1}****${cardNumber4}`,
        isRepresent: userPayment.isRepresent,
        createdAt: userPayment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Billing card issue error:', error);
    return NextResponse.json<IBillingCardIssueResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '카드 등록 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
