'use client';

import React from 'react';
import type { ITodos } from '@/types/todos';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import EditableCell from './EditableCell';

type Props = {
  todo: ITodos;
  setSelectedTodo: (todo: ITodos) => void;
  isChecked: boolean;
  onCheck: (uid: string, checked: boolean) => void;
  onFieldSave: (
    uid: string,
    field: 'name' | 'email',
    newValue: string,
    onSuccess: (val: string) => void,
    onError: () => void,
  ) => void;
};

const ListRow = ({
  todo,
  setSelectedTodo,
  isChecked,
  onCheck,
  onFieldSave,
}: Props) => {
  return (
    <tr key={todo.idx}>
      <th scope="row">
        <input
          className="btn-check"
          type="checkbox"
          id={`checkedRow${todo.idx}`}
          autoComplete="off"
          checked={isChecked}
          onChange={(e) => onCheck(todo.uid, e.target.checked)}
        />
        <label className="btn border-0 p-0" htmlFor={`checkedRow${todo.idx}`}>
          <FontAwesomeIcon icon={isChecked ? faSquareCheck : faSquare} />
          &nbsp;
          {todo.idx}
        </label>
      </th>
      <td className="text-center">
        <span className="badge text-bg-secondary">{todo.uid}</span>
      </td>
      <td className="text-center">
        <EditableCell
          value={todo.name}
          onSave={(newVal, onSuccess, onError) =>
            onFieldSave(todo.uid, 'name', newVal, onSuccess, onError)
          }
        />
      </td>
      <td className="text-center">
        {' '}
        <EditableCell
          value={todo.email}
          onSave={(newVal, onSuccess, onError) =>
            onFieldSave(todo.uid, 'email', newVal, onSuccess, onError)
          }
        />
      </td>
      <td className="text-center">
        {new Date(todo.createdAt).toLocaleDateString()}
      </td>
      <td className="text-center">
        {new Date(todo.updatedAt).toLocaleDateString()}
      </td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-danger btn-sm"
          data-bs-toggle="modal"
          data-bs-target={`#confirmDeleteModal`}
          onClick={() => setSelectedTodo(todo)}
        >
          <FontAwesomeIcon icon={faTrash} />
          &nbsp;삭제
        </button>
      </td>
    </tr>
  );
};

export default ListRow;
