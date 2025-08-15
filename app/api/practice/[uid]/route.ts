import { NextResponse } from 'next/server';
import { show, remove, update } from '@/services/practice.service';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { UpdateSchema } from '@/actions/practice/update/schema';

type Params = { params: { uid: string } };

export async function GET(_req: Request, { params }: Params) {
  try {
    const data = await show(params.uid);
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    console.error('[GET /api/practice/:uid] error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  const language = await ckLocale();
  const dict = await getDictionary(language);
  const missing = await __ts('common.form.missingFields', {}, language);

  try {
    const body = await req.json();
    // 경로의 uid를 스키마 입력에 강제 주입
    const payload = { ...body, uid: params.uid };
    const parsed = UpdateSchema(dict.common.form).safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { status: 'error', message: missing },
        { status: 400 },
      );
    }

    try {
      const rs = await update(parsed.data);
      const ok = await __ts('common.save_success', {}, language);
      return NextResponse.json(
        { status: 'success', message: ok, data: rs },
        { status: 200 },
      );
    } catch (err: any) {
      if (err?.message === 'NOT_FOUND') {
        const notExist = await __ts(
          'common.form.notExist',
          { column: params.uid },
          language,
        );
        return NextResponse.json(
          { status: 'error', message: notExist },
          { status: 404 },
        );
      }
      throw err;
    }
  } catch (err) {
    console.error('[PUT /api/practice/:uid] error:', err);
    const fail = await __ts('common.save_failed', {}, language);
    return NextResponse.json(
      { status: 'error', message: fail },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { searchParams } = new URL(req.url);
    const hard = searchParams.get('hard') === 'true';

    const rs = await remove({ uid: params.uid, hard });
    return NextResponse.json({ status: 'success', data: rs }, { status: 200 });
  } catch (err: any) {
    const code = err?.message === 'NOT_FOUND' ? 404 : 500;
    return NextResponse.json(
      { status: 'error', message: err?.message ?? 'Server error' },
      { status: code },
    );
  }
}
