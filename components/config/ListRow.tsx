'use client';

import React from 'react';
import type { IConfig, ListEditCell } from '@/types/config';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import EditableCell from './EditableCell';

type Props = {
  row: IConfig;
  setSelectedRow: (row: IConfig) => void;
  isChecked: boolean;
  onCheck: (uid: string, checked: boolean) => void;
  onFieldSave: (
    uid: string,
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
        <span className="badge text-bg-primary">{row.uid}</span>
      </td>
      <td className="text-center">
        <span className="badge text-bg-secondary">{row.CNFname}</span>
      </td>
      <td className="text-center">
        <EditableCell
          value={row.CNFvalue ?? '-'}
          onSave={(newVal, onSuccess, onError) =>
            onFieldSave(row.uid, 'CNFvalue', newVal, onSuccess, onError)
          }
        />
      </td>
      <td className="text-center">
        <EditableCell
          value={row.CNFvalue_en ?? '-'}
          onSave={(newVal, onSuccess, onError) =>
            onFieldSave(row.uid, 'CNFvalue_en', newVal, onSuccess, onError)
          }
        />
      </td>
      <td className="text-center">
        <EditableCell
          value={row.CNFvalue_ja ?? '-'}
          onSave={(newVal, onSuccess, onError) =>
            onFieldSave(row.uid, 'CNFvalue_ja', newVal, onSuccess, onError)
          }
        />
      </td>
      <td className="text-center">
        <EditableCell
          value={row.CNFvalue_zh ?? '-'}
          onSave={(newVal, onSuccess, onError) =>
            onFieldSave(row.uid, 'CNFvalue_zh', newVal, onSuccess, onError)
          }
        />
      </td>

      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
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
