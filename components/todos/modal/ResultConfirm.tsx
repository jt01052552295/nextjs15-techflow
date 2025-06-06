'use client';

import React from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { useListMemory } from '@/hooks/useListMemory';
type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const ResultConfirm = ({ isOpen, setIsOpen }: Props) => {
  const { locale, t } = useLanguage();
  const pathname = 'todos';
  const listMemory = useListMemory(pathname);

  const goToList = () => {
    listMemory.clear();
    window.location.href = getRouteUrl('todos.index', locale);
  };

  return (
    <div
      className={`modal fade show ${isOpen ? `d-block` : `d-none`} `}
      id={`result-confirm`}
      tabIndex={-1}
      aria-labelledby="result-confirm-modal-Label"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="result-confirm-modal-Label">
              {t('common.notification')}
            </h1>
            <button
              type="button"
              className="btn-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {t('common.keep_action', {
              action: t('common.create'),
            })}
          </div>
          <div className="modal-footer justify-content-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsOpen(false)}
            >
              {t('common.close')}
            </button>
            <button className="btn btn-outline-primary" onClick={goToList}>
              <FontAwesomeIcon icon={faList} />
              &nbsp;{t('common.list')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultConfirm;
