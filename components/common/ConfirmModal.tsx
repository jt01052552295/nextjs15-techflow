'use client';

import React from 'react';
import { useConfirmModalStore } from '@/store/confirmModal';
import { useLanguage } from '@/components/context/LanguageContext';
const ConfirmModal: React.FC = () => {
  const { t } = useLanguage();
  const { isOpen, message, title, handleConfirm, handleCancel } =
    useConfirmModalStore();

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex={-1}
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title || t('common.AppName')}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleCancel}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
