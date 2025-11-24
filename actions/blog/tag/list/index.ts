'use server';

import type { ListParams, ListResult } from '@/types/blog/tag';
import { list } from '@/services/blog/tag.service';
import type { IBlogTagListRow } from '@/types/blog/tag';
import { fmtDateD } from '@/lib/util';
import { getAllTags } from '@/lib/blog/tag-utils';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IBlogTagListRow>> {
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

function toDTO(row: any): IBlogTagListRow {
  return {
    ...row,
    createdAt: fmtDateD(row.createdAt),
    updatedAt: fmtDateD(row.updatedAt),
  };
}

export async function fetchAllBlogTagAction() {
  return await getAllTags();
}
