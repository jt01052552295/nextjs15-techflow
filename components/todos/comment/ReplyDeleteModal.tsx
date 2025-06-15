'use client';
import { useLanguage } from '@/components/context/LanguageContext';
interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ReplyDeleteModal({
  visible,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useLanguage();
  if (!visible) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t('common.delete')}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>
          <div className="modal-body">
            <p>{t('common.confirm_delete')}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>
              {t('common.cancel')}
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
