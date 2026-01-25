import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';
import { maskingUserName } from '@/lib/util';
import { IFindIdRequest, IFindIdResponse, IApiResult } from '@/types_api/auth';

// POST /api/v1/auth/find-id
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IFindIdRequest;
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.MISSING_FIELDS,
          message: '이메일 또는 전화번호가 필요합니다.',
        },
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
      select: { username: true },
    });

    if (!user) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.USER_NOT_FOUND,
          message: '사용자를 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json<IApiResult<IFindIdResponse>>({
      success: true,
      code: API_CODE.SUCCESS.FIND_ID,
      data: {
        username: maskingUserName(user.username),
      },
    });
  } catch (error) {
    console.error('Find ID Error:', error);
    return NextResponse.json<IApiResult<null>>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
