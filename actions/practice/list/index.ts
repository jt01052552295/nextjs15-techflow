'use server';

import type { ListParams, ListResult } from '@/types/practice';
import { list } from '@/services/practice.service';

export async function listAction(params?: ListParams): Promise<ListResult> {
  try {
    return await list(params ?? {});
  } catch (err) {
    console.error('[listAction] error:', err);
    throw err;
  }
}
