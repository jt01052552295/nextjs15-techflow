'use client';

import React from 'react';
import type { ITodosListRow, ITodosFilterType } from '@/types/todos';
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
  row: ITodosListRow;
};

const ListRow = ({ row }: Props) => {
  const { locale } = useLanguage();
  const router = useRouter();

  //   const showUrl = getRouteUrl('todos.show', locale, { id: row.uid });
  //   const editUrl = getRouteUrl('todos.edit', locale, { id: row.uid });

  //   const handleNavigate = (url: string) => {
  //     listMemory.save({ scrollY: window.scrollY, page, filters, items }); // ✅ 일괄 저장
  //     router.push(url);
  //   };

  return (
    <tr key={row.idx}>
      <th scope="row">
        <input
          className="btn-check"
          type="checkbox"
          id={`checkedRow${row.idx}`}
          autoComplete="off"
        />
        <label className="btn border-0 p-0" htmlFor={`checkedRow${row.idx}`}>
          <FontAwesomeIcon icon={faSquare} />
          &nbsp;
          {row.idx}
        </label>
      </th>
      <td className="text-center">
        <span className="badge text-bg-secondary">{row.uid}</span>
      </td>
      <td className="text-center">{row.name}</td>
      <td className="text-center">{row.email}</td>
      <td className="text-center">{row.createdAt}</td>
      <td className="text-center">{row.updatedAt}</td>
      <td className="text-center">
        {row._count?.TodosFile ?? 0} {row._count?.TodosComment ?? 0}{' '}
        {row._count?.TodosOption ?? 0}
      </td>
      <td className="text-center">
        <div className="d-flex gap-1">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => console.log('123')}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => console.log('123')}
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            data-bs-toggle="modal"
            data-bs-target={`#confirmDeleteModal`}
            onClick={() => console.log('123')}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ListRow;
