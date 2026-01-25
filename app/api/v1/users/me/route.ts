import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import { IUpdateAccountRequest, IApiResult } from '@/types_api/user/settings';

export async function GET() {
  try {
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

    return NextResponse.json<IApiResult<typeof user>>(
      {
        success: true,
        code: API_CODE.SUCCESS.FETCH_USER,
        data: user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Fetch User Error:', error);
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

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as IUpdateAccountRequest;
    const { username, phone, email, zipcode, addr1, addr2 } = body;

    await prisma.user.update({
      where: { id: session.id },
      data: {
        username,
        phone,
        email,
        zipcode,
        addr1,
        addr2,
      },
    });

    return NextResponse.json<IApiResult<null>>(
      {
        success: true,
        code: API_CODE.SUCCESS.UPDATE_USER,
        message: '계정 정보가 업데이트되었습니다.',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Update User Error:', error);
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
