'use server';

import { show } from '@/services/fcm/message.service';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

import type { IFcmMessage } from '@/types/fcm/message';

export async function showAction(uid: string): Promise<IFcmMessage> {
  const language = await ckLocale();
  const missingFields = await __ts(
    'common.form.notExist',
    { column: uid },
    language,
  );

  try {
    const rs = await show(uid);
    return rs as unknown as IFcmMessage;
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') {
      throw new Error(missingFields);
    }
    console.error('[showAction] error:', err);
    throw err;
  }
}
