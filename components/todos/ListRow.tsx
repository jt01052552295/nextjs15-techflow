'use client';

import React from 'react';
import type { ITodos, ITodosFilterType } from '@/types/todos';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faPen,
  faTrash,
  faSquareCheck,
} from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import EditableCell from './EditableCell';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { useSearchParams } from 'next/navigation';
import { useListMemory } from '@/hooks/useListMemory';

type Props = {
  row: ITodos;
  setSelectedTodo: (row: ITodos) => void;
  isChecked: boolean;
  onCheck: (uid: string, checked: boolean) => void;
  onFieldSave: (
    uid: string,
    field: 'name' | 'email',
    newValue: string,
    onSuccess: (val: string) => void,
    onError: () => void,
  ) => void;
  items: ITodos[];
  page: number;
  filters: ITodosFilterType | null;
};

const ListRow = ({
  row,
  setSelectedTodo,
  isChecked,
  onCheck,
  onFieldSave,
  items,
  page,
  filters,
}: Props) => {
  const { locale } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const listMemory = useListMemory('todos');

  const showUrl = getRouteUrl('todos.show', locale, { id: row.uid });
  const editUrl = getRouteUrl('todos.edit', locale, { id: row.uid });

  const handleNavigate = (url: string) => {
    listMemory.save({ scrollY: window.scrollY, page, filters, items }); // ✅ 일괄 저장
    router.push(url);
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
          onChange={(e) => onCheck(row.uid, e.target.checked)}
        />
        <label className="btn border-0 p-0" htmlFor={`checkedRow${row.idx}`}>
          <FontAwesomeIcon icon={isChecked ? faSquareCheck : faSquare} />
          &nbsp;
          {row.idx}
        </label>
      </th>
      <td className="text-center">
        <span className="badge text-bg-secondary">{row.uid}</span>
      </td>
      <td className="text-center">
        <EditableCell
          value={row.name}
          onSave={(newVal, onSuccess, onError) =>
            onFieldSave(row.uid, 'name', newVal, onSuccess, onError)
          }
        />
      </td>
      <td className="text-center">
        <EditableCell
          value={row.email}
          onSave={(newVal, onSuccess, onError) =>
            onFieldSave(row.uid, 'email', newVal, onSuccess, onError)
          }
        />
      </td>
      <td className="text-center">
        {new Date(row.createdAt).toLocaleDateString()}
      </td>
      <td className="text-center">
        {new Date(row.updatedAt).toLocaleDateString()}
      </td>
      <td className="text-center">
        <div className="d-flex gap-1">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() =>
              handleNavigate(`${showUrl}?${searchParams.toString()}`)
            }
          >
            <FontAwesomeIcon icon={faEye} />
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() =>
              handleNavigate(`${editUrl}?${searchParams.toString()}`)
            }
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            data-bs-toggle="modal"
            data-bs-target={`#confirmDeleteModal`}
            onClick={() => setSelectedTodo(row)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ListRow;
