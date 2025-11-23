'use server';

import { show } from '@/services/shop/review.service';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import type { IShopReview } from '@/types/shop/review';

export async function showAction(uid: string): Promise<IShopReview> {
  const language = await ckLocale();
  const missingFields = await __ts(
    'common.form.notExist',
    { column: uid },
    language,
  );

  try {
    const rs = await show(uid);
    return rs as unknown as IShopReview;
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') {
      throw new Error(missingFields);
    }
    console.error('[showAction] error:', err);
    throw err;
  }
}
