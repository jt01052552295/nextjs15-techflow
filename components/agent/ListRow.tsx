'use client';

import React from 'react';
import type { IAgentLog, IAgentLogListRow } from '@/types/agent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';

type Props = {
  row: IAgentLogListRow;
  setSelectedRow: (row: IAgentLog) => void;
  isChecked: boolean;
  onCheck: (uid: string, checked: boolean) => void;
};

const ListRow = ({ row, setSelectedRow, isChecked, onCheck }: Props) => {
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
        <span className="badge text-bg-secondary">{row.browser}</span>
        <span className="badge text-bg-primary">{row.browserVersion}</span>
      </td>
      <td className="text-center">
        <span className="badge text-bg-secondary">{row.os}</span>
        <span className="badge text-bg-primary">{row.osVersion}</span>
      </td>
      <td className="text-center">
        <span className="badge text-bg-secondary">{row.device}</span>
      </td>
      <td className="text-center">{row.ip}</td>
      <td className="text-center">{row.referer}</td>
      <td className="text-center">{row.keyword}</td>
      <td className="text-center">{row.createdAt}</td>
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
