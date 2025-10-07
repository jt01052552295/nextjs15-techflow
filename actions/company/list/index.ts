'use server';

import type { ListParams, ListResult, ICompany } from '@/types/company';
import { list } from '@/services/company.service';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<ICompany>> {
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

function toDTO(row: any): ICompany {
  return {
    ...row,
  };
}
