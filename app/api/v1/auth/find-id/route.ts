import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';
import { maskingUserName } from '@/lib/util';

// POST /api/v1/auth/find-id
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    // 사용자 조회 (이메일 또는 전화번호로 검색)
    const whereConditions = [];
    if (email) whereConditions.push({ email });
    if (phone) whereConditions.push({ phone });

    const user = await prisma.user.findFirst({
      where: {
        OR: whereConditions,
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
      username: maskingUserName(user.username),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
