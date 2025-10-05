'use server';

import { show } from '@/services/category.service';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import type { ICategory } from '@/types/category';

export async function showAction(uid: string): Promise<ICategory> {
  const language = await ckLocale();
  const missingFields = await __ts(
    'common.form.notExist',
    { column: uid },
    language,
  );

  try {
    const rs = await show(uid);
    return rs as unknown as ICategory;
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') {
      throw new Error(missingFields);
    }
    console.error('[showAction] error:', err);
    throw err;
  }
}
