'use server';

import type { ListParams, ListResult } from '@/types/blog/category';
import { list } from '@/services/blog/category.service';
import type { IBlogCategoryListRow } from '@/types/blog/category';
import { fmtDateD } from '@/lib/util';
import { getAllCategories } from '@/lib/blog/category-utils';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IBlogCategoryListRow>> {
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

function toDTO(row: any): IBlogCategoryListRow {
  return {
    ...row,
    createdAt: fmtDateD(row.createdAt),
    updatedAt: fmtDateD(row.updatedAt),
  };
}

export async function fetchAllBlogCategoryAction() {
  return await getAllCategories();
}
