'use server';

import { show } from '@/services/user.service';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

import type { IUser } from '@/types/user';

export async function showAction(id: string): Promise<IUser> {
  const language = await ckLocale();
  const missingFields = await __ts(
    'common.form.notExist',
    { column: id },
    language,
  );

  try {
    const rs = await show(id);
    return rs as unknown as IUser;
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') {
      throw new Error(missingFields);
    }
    console.error('[showAction] error:', err);
    throw err;
  }
}
