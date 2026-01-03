import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';
import { maskingEmail } from '@/lib/util';

// POST /api/v1/auth/find-id
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    // 사용자 조회
    const user = await prisma.user.findFirst({
      where: {
        name,
        phone,
        isUse: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.USER_NOT_FOUND },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      code: API_CODE.SUCCESS.FIND_ID,
      email: maskingEmail(user.email), // 이메일 마스킹 처리하여 반환
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
