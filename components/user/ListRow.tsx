'use client';

import React from 'react';
import type { IUser, IUserListRow, ListEditCell } from '@/types/user';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPen,
  faTrash,
  faSquareCheck,
} from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import EditableCell from './EditableCell';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { useSearchParams } from 'next/navigation';
import ThumbnailWidget from '../common/ThumbnailWidget';

type Props = {
  row: IUserListRow;
  setSelectedRow: (row: IUser) => void;
  isChecked: boolean;
  onCheck: (id: string, checked: boolean) => void;
  onFieldSave: (
    id: string,
    field: ListEditCell,
    newValue: string,
    onSuccess: (val: string) => void,
    onError: () => void,
  ) => void;
};

const ListRow = ({
  row,
  setSelectedRow,
  isChecked,
  onCheck,
  onFieldSave,
}: Props) => {
  const { locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const editUrl = getRouteUrl('user.edit', locale, { id: row.id });

  console.log(row);

  //  listMemory.save({ scrollY: window.scrollY, page, filters, items }); // ✅ 일괄 저장
  const handleNavigate = (href: string) => {
    if (!href || typeof href !== 'string') return; // 방어
    router.push(href, { scroll: false });
  };

  return (
    <tr key={row.idx}>
      <th scope="row">
        <input
          className="btn-check"
          type="checkbox"
          id={`checkedRow${row.idx}`}
          autoComplete="off"
          checked={isChecked}
          onChange={(e) => onCheck(row.id, e.target.checked)}
        />
        <label className="btn border-0 p-0" htmlFor={`checkedRow${row.idx}`}>
          <FontAwesomeIcon icon={isChecked ? faSquareCheck : faSquare} />
          &nbsp;
          {row.idx}
        </label>
      </th>
      <td className="text-center">
        {row.profile?.[0]?.url && (
          <ThumbnailWidget url={row.profile?.[0]?.url} />
        )}
      </td>
      <td className="text-center">
        <span className="badge text-bg-secondary">{row.id}</span>
      </td>
      <td className="text-center">
        <EditableCell
          value={row.name}
          onSave={(newVal, onSuccess, onError) =>
            onFieldSave(row.id, 'name', newVal, onSuccess, onError)
          }
        />
      </td>
      <td className="text-center">
        <EditableCell
          value={row.nick}
          onSave={(newVal, onSuccess, onError) =>
            onFieldSave(row.id, 'nick', newVal, onSuccess, onError)
          }
        />
      </td>
      <td className="text-center">{row.createdAt}</td>
      <td className="text-center">{row.updatedAt}</td>
      <td className="text-center">{row._count?.accounts ?? 0}</td>
      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() =>
              handleNavigate(
                `${editUrl}${queryString ? `?${queryString}` : ''}`,
              )
            }
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            data-bs-toggle="modal"
            data-bs-target={`#confirmDeleteModal`}
            onClick={() => setSelectedRow(row)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ListRow;
