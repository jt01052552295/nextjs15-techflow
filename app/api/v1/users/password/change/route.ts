import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';
import { API_CODE } from '@/constants/api-code';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.UNAUTHORIZED },
        { status: 401 },
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.USER_NOT_FOUND },
        { status: 404 },
      );
    }

    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.INVALID_CREDENTIALS },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      {
        success: true,
        code: API_CODE.SUCCESS.CHANGE_PASSWORD,
        message: '비밀번호가 변경되었습니다.',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Change Password Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
