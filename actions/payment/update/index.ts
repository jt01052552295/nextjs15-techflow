'use server';

import { UpdateType, UpdateSchema } from './schema';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { update } from '@/services/payment.service';

export async function updateAction(data: UpdateType) {
  const language = await ckLocale();
  const dict = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const parsed = UpdateSchema(dict.common.form).safeParse(data);
  if (!parsed.success) {
    return { status: 'error', message: missingFields };
  }

  try {
    const rs = await update(parsed.data);
    const ok = await __ts('common.save_success', {}, language);
    return { status: 'success', message: ok, data: rs };
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') {
      const notExist = await __ts(
        'common.form.notExist',
        { column: parsed.data.uid },
        language,
      );
      return { status: 'error', message: notExist };
    }
    console.error('[updateAction] error:', err);
    const fail = await __ts('common.save_failed', {}, language);
    return { status: 'error', message: fail, error: err?.message };
  }
}
