'use server';

import { show } from '@/services/point.service';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import type { IPoint } from '@/types/point';

export async function showAction(idx: number): Promise<IPoint> {
  const language = await ckLocale();
  const missingFields = await __ts(
    'common.form.notExist',
    { column: idx },
    language,
  );

  try {
    const rs = await show(idx);
    return rs as unknown as IPoint;
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') {
      throw new Error(missingFields);
    }
    console.error('[showAction] error:', err);
    throw err;
  }
}
