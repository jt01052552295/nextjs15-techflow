'use server';

import type { ListParams, ListResult, IUserListRow } from '@/types/user';
import { list } from '@/services/user.service';
import { fmtDateD } from '@/lib/util';
import { getActiveUsers } from '@/lib/user-utils';

export async function listAction(
  params?: ListParams,
): Promise<ListResult<IUserListRow>> {
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

function toDTO(row: any): IUserListRow {
  return {
    ...row,
    emailVerified: fmtDateD(row.emailVerified),
    signUpVerified: fmtDateD(row.signUpVerified),
    createdAt: fmtDateD(row.createdAt),
    updatedAt: fmtDateD(row.updatedAt),
  };
}

export async function fetchActiveUsersAction() {
  return await getActiveUsers();
}
