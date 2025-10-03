'use server';

import { cookies } from 'next/headers';
import { CreateType, CreateSchema } from './schema';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { create } from '@/services/config.service';

export async function createAction(data: CreateType) {
  const language = await ckLocale();
  const dict = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const parsed = CreateSchema(dict.common.form).safeParse(data);
  if (!parsed.success) {
    const errorDetails = parsed.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    return {
      status: 'error',
      message: missingFields,
      error: 'validation_error',
      data,
      errorDetails,
    };
  }

  try {
    const {
      uid,
      // 나머지는 service로 그대로 전달
    } = parsed.data;

    // uid 중복 메시지
    const alreadyUseuid = await __ts(
      'common.form.alreadyUse',
      { column: uid },
      language,
    );

    let rs = null;
    try {
      rs = await create(parsed.data);
    } catch (err: any) {
      if (
        typeof err?.message === 'string' &&
        err.message.startsWith('UID_ALREADY_USED:')
      ) {
        throw new Error(alreadyUseuid);
      }
      throw err;
    }

    const ok = await __ts('common.save_success', {}, language);
    return { status: 'success', message: ok, data: rs };
  } catch (error: any) {
    console.error('[config/createAction] error:', error);
    const fail = await __ts('common.save_failed', {}, language);
    return { status: 'error', error: error.message, message: fail };
  }
}
