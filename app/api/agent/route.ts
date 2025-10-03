import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { create } from '@/services/agent.service';

export async function POST(req: Request) {
  const language = await ckLocale();

  try {
    const body = await req.json();
    if (!body || !body.data) {
      return NextResponse.json(
        { status: 'error', message: 'Bad Request' },
        { status: 400 },
      );
    }

    const { ip, isRobot } = body.data;

    if (isRobot) {
      return NextResponse.json({
        status: 'error',
        message: 'Robot access detected. Skipping log.',
      });
    }

    // 쿠키(user-ip)
    const cookieStore = await cookies();
    const hasCookie = cookieStore.has('agent-user-ip');
    const cookieValue = cookieStore.get('agent-user-ip')?.value;
    if (hasCookie && cookieValue === ip) {
      return NextResponse.json(
        { status: 'error', message: `이미 기록된 IP입니다: ${ip}` },
        { status: 409 },
      );
    }

    let created;
    try {
      created = await create(body.data);

      // 성공적으로 생성된 경우에만 쿠키 설정
      const ok = await __ts('common.save_success', {}, language);
      const response = NextResponse.json(
        { status: 'success', message: ok, data: created },
        { status: 201 },
      );

      // 응답 객체에 쿠키 설정
      if (!hasCookie && ip) {
        const maxAge = 60 * 60 * 24 * 1;
        response.cookies.set('agent-user-ip', ip, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: maxAge,
          path: '/',
        });
      }

      return response;
    } catch (err: any) {
      if (
        typeof err?.message === 'string' &&
        err.message.startsWith('UID_ALREADY_USED:')
      ) {
        return NextResponse.json(
          { status: 'error', message: 'alreadyUseuid:' + ip },
          { status: 409 },
        );
      }
      throw err;
    }
  } catch (err) {
    console.error('[POST /api/agent] error:', err);
    const fail = await __ts('common.save_failed', {}, language);
    return NextResponse.json(
      { status: 'error', message: fail },
      { status: 500 },
    );
  }
}
