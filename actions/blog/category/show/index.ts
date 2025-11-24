'use server';

import { show } from '@/services/blog/category.service';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import type { IBlogCategory } from '@/types/blog/category';

export async function showAction(uid: string): Promise<IBlogCategory> {
  const language = await ckLocale();
  const missingFields = await __ts(
    'common.form.notExist',
    { column: uid },
    language,
  );

  try {
    const rs = await show(uid);
    return rs as unknown as IBlogCategory;
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') {
      throw new Error(missingFields);
    }
    console.error('[showAction] error:', err);
    throw err;
  }
}
