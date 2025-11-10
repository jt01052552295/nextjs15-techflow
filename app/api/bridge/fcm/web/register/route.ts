import { NextResponse } from 'next/server';
import { registerWebToken } from '@/services/fcm/token.service';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fcm_token, user } = body;

    // 입력값 검증
    if (!fcm_token || !user) {
      return NextResponse.json(
        {
          status: 'validator',
          message: 'fcm_token and user are required',
        },
        { status: 400 },
      );
    }

    // User-Agent 정보 가져오기
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';

    // 간단한 bot 체크 (실제로는 더 정교한 체크가 필요할 수 있음)
    const isRobot = /bot|crawler|spider|crawling/i.test(userAgent);
    if (isRobot) {
      throw new Error('웹토큰 생성 불가.');
    }

    // 플랫폼 및 브라우저 정보 파싱 (간단한 버전)
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
    const platform = isMobile ? 'mobile' : 'desktop';

    if (platform !== 'desktop') {
      throw new Error('데스크톱에서만 가능합니다.');
    }

    // OS 감지
    let os = 'Unknown';
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac OS')) {
      os = 'Mac OS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    }

    // 브라우저 감지
    let browser = 'Unknown';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Edg')) {
      browser = 'Edge';
    }

    // 웹 토큰 등록
    await registerWebToken({
      userId: user.toString(),
      token: fcm_token,
      userAgent,
      platform,
      browser,
      os,
    });

    return NextResponse.json(
      {
        status: 'ok',
        message: '저장되었습니다.',
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );
  } catch (error) {
    console.error('Web token register error:', error);
    const message =
      error instanceof Error ? error.message : '웹 토큰 등록에 실패했습니다.';

    return NextResponse.json(
      {
        status: 'fail',
        message,
      },
      { status: 500 },
    );
  }
}
