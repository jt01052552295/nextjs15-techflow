import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { list, create, remove } from '@/services/practice.service';
import { CreateSchema } from '@/actions/practice/create/schema';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get('name') || undefined;
    const email = searchParams.get('email') || undefined;
    const dateType =
      (searchParams.get('dateType') as 'createdAt' | 'updatedAt' | null) ||
      undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // 불리언(없으면 undefined)
    const isUseParam = searchParams.get('isUse');
    const isUse = isUseParam === null ? undefined : isUseParam === 'true';

    const isVisibleParam = searchParams.get('isVisible');
    const isVisible =
      isVisibleParam === null ? undefined : isVisibleParam === 'true';

    // 정렬(컬럼명/방향, 기본값 설정)
    const sortBy =
      (searchParams.get('sortBy') as
        | 'idx'
        | 'name'
        | 'email'
        | 'createdAt'
        | 'updatedAt'
        | 'sortOrder'
        | null) || 'createdAt';
    const order =
      (searchParams.get('order') as 'asc' | 'desc' | null) || 'desc';

    // 숫자(limit) 파싱 (NaN 방지)
    const limitStr = searchParams.get('limit');
    const limit = limitStr !== null ? Number(limitStr) : undefined;
    const safeLimit = Number.isFinite(limit as number)
      ? (limit as number)
      : undefined;

    // 커서/디버그
    const cursor = searchParams.get('cursor') || undefined;

    const data = await list({
      name,
      email,
      dateType,
      startDate,
      endDate,
      isUse,
      isVisible,
      sortBy,
      order,
      limit: safeLimit,
      cursor,
    });
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error('[GET /api/practice] error:', err);
    return NextResponse.json(
      { message: 'Failed to load practice list' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const language = await ckLocale();
  const dict = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  try {
    const body = await req.json();
    const parsed = CreateSchema(dict.common.form).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 'error', message: missingFields },
        { status: 400 },
      );
    }

    const { uid, ipAddress } = parsed.data;

    // 쿠키(user-ip)
    const cookieStore = await cookies();
    if (!cookieStore.has('user-ip') && ipAddress) {
      const oneDay = 24 * 60 * 60 * 1000;
      cookieStore.set('user-ip', ipAddress, { expires: Date.now() + oneDay });
    }

    const alreadyUseuid = await __ts(
      'common.form.alreadyUse',
      { column: uid },
      language,
    );

    let created;
    try {
      created = await create(parsed.data); // ⬅️ CreateTodosType 그대로 전달
    } catch (err: any) {
      if (
        typeof err?.message === 'string' &&
        err.message.startsWith('UID_ALREADY_USED:')
      ) {
        return NextResponse.json(
          { status: 'error', message: alreadyUseuid },
          { status: 409 },
        );
      }
      throw err;
    }

    const ok = await __ts('common.save_success', {}, language);
    return NextResponse.json(
      { status: 'success', message: ok, data: created },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/practice] error:', err);
    const fail = await __ts('common.save_failed', {}, language);
    return NextResponse.json(
      { status: 'error', message: fail },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { uids, hard } = body as { uids?: string[]; hard?: boolean };

    if (!uids || uids.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'uids required' },
        { status: 400 },
      );
    }

    const rs = await remove({ uids, hard: !!hard });
    return NextResponse.json({ status: 'success', data: rs }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
