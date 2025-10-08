'use client';

import React from 'react';
import { IBoardListRow } from '@/types/board';
import { deleteAction } from '@/actions/board/delete';

import { toast } from 'sonner';
import { useLanguage } from '@/components/context/LanguageContext';

type Props = {
  row: IBoardListRow | null;
  uids?: string[];
  onDeleted: (deletedUids: string[]) => void;
};

const DeleteConfirmModal = ({ row, uids, onDeleted }: Props) => {
  const { t } = useLanguage();

  const handleDelete = async () => {
    const deletedUids: string[] = row ? [row.uid] : (uids ?? []);
    if (deletedUids.length === 0) return;

    const formData = row ? { uid: row.uid } : { uids };

    const response = await deleteAction(formData);
    if (response.data && response.status === 'success') {
      toast.success(response.message);
      onDeleted(deletedUids); // 상위에서 갱신 처리
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
            <h5 className="modal-title">{t('common.AppName')}</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            {row ? (
              <p
                dangerouslySetInnerHTML={{
                  __html: t('common.confirm_delete_single', {
                    name: row.bdName,
                  }),
                }}
              />
            ) : (
              <p>{t('common.confirm_delete_multi', { count: uids?.length })}</p>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              data-bs-dismiss="modal"
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
