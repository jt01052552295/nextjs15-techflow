import { NextResponse } from 'next/server';
import { getVersionInfo } from '@/services/setup.service';

export async function GET() {
  try {
    const versionData = await getVersionInfo();

    // Setup 데이터가 없는 경우 기본값 반환
    if (!versionData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Setup configuration not found',
          data: null,
        },
        { status: 404 },
      );
    }

    // Laravel과 동일한 형태로 응답 데이터 구성
    const payload = {
      ...versionData,
      message:
        '새 버전이 출시되었습니다. 안정적 이용을 위해 업데이트 해주세요.',
    };

    const json = {
      success: true,
      message: 'version',
      data: payload,
    };

    return NextResponse.json(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Version check error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        data: null,
      },
      { status: 500 },
    );
  }
}
