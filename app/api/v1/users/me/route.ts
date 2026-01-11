import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';

export async function GET() {
  try {
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.UNAUTHORIZED },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      code: API_CODE.SUCCESS.FETCH_USER,
      data: user,
    });
  } catch (error) {
    console.error('Fetch User Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
