'use client';

import React from 'react';
import { ITodos } from '@/types/todos';
import { deleteAction } from '@/actions/todos/delete';
import { toast } from 'sonner';

type Props = {
  todo: ITodos | null;
  uids?: string[];
  onDeleted: () => void;
};

const DeleteConfirmModal = ({ todo, uids, onDeleted }: Props) => {
  const handleDelete = async () => {
    const formData = todo ? { uid: todo.uid } : { uids };

    console.log(formData);
    const response = await deleteAction(formData);
    console.log(response);

    if (response.data && response.status === 'success') {
      toast.success(response.message);
      onDeleted(); // 상위에서 갱신 처리
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div
      className="modal fade"
      id="confirmDeleteModal"
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">삭제 확인</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            {todo ? (
              <p>
                <strong>{todo.name}</strong> 항목을 삭제하시겠습니까?
              </p>
            ) : (
              <p>{uids?.length}건을 삭제하시겠습니까?</p>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              취소
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
            >
              삭제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
