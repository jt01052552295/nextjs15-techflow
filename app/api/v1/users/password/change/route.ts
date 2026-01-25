import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';
import { API_CODE } from '@/constants/api-code';
import { IChangePasswordRequest, IApiResult } from '@/types_api/user/settings';

export async function POST(request: Request) {
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

    const { currentPassword, newPassword } =
      (await request.json()) as IChangePasswordRequest;

    if (!currentPassword || !newPassword) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.MISSING_FIELDS,
          message: '모든 필드를 입력해주세요.',
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
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

    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.INVALID_CREDENTIALS,
          message: '현재 비밀번호가 일치하지 않습니다.',
        },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json<IApiResult<null>>(
      {
        success: true,
        code: API_CODE.SUCCESS.CHANGE_PASSWORD,
        message: '비밀번호가 변경되었습니다.',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Change Password Error:', error);
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
