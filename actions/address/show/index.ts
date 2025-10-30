'use server';

import { show } from '@/services/address.service';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

import type { IAddress } from '@/types/address';

export async function showAction(uid: string): Promise<IAddress> {
  const language = await ckLocale();
  const missingFields = await __ts(
    'common.form.notExist',
    { column: uid },
    language,
  );

  try {
    const rs = await show(uid);
    return rs as unknown as IAddress;
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') {
      throw new Error(missingFields);
    }
    console.error('[showAction] error:', err);
    throw err;
  }
}
