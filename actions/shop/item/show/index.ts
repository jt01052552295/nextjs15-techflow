'use server';

import { show } from '@/services/shop/item.service';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
// ITodosPart가 있다면 그대로 반환 타입에 사용
import type { IShopItem } from '@/types/shop/item';

export async function showAction(uid: string): Promise<IShopItem> {
  const language = await ckLocale();
  const missingFields = await __ts(
    'common.form.notExist',
    { column: uid },
    language,
  );

  try {
    const rs = await show(uid);
    return rs as unknown as IShopItem;
  } catch (err: any) {
    if (err?.message === 'NOT_FOUND') {
      throw new Error(missingFields);
    }
    console.error('[showAction] error:', err);
    throw err;
  }
}
