'use server';

import type {
  ListParams,
  ListResult,
  IFcmTemplate,
} from '@/types/fcm/template';
import { list } from '@/services/fcm/template.service';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IFcmTemplate>> {
  try {
    const rs = await list(params ?? {});

    return {
      ...rs,
      items: rs.items.map(toDTO),
    };
  } catch (err) {
    console.error('[listAction] error:', err);
    throw err;
  }
}

function toDTO(row: any): IFcmTemplate {
  return {
    ...row,
  };
}
