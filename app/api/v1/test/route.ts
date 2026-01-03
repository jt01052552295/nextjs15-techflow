import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';

// GET /api/v1/user/me
// RN 앱에서 내 정보를 불러올 때 사용
export async function GET() {
  try {
    // 1. 공통 Auth 유틸을 사용하여 세션 확인 (헤더 토큰 지원됨)
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.UNAUTHORIZED },
        { status: 401 },
      );
    }

    // 2. 필요한 데이터만 응답 (Service 로직 재사용 가능)
    // 예: const point = await getAvailablePoint(session.id);

    return NextResponse.json({
      success: true,
      code: API_CODE.SUCCESS.FETCH_USER,
      user: session,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
