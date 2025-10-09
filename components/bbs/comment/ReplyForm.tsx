'use client';
import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

interface ReplyFormProps {
  parentId: number;
  onSubmit: (content: string, parentId: number) => void;
  onCancel: () => void;
  isPending: boolean;
}

const ReplyForm = ({
  parentId,
  onSubmit,
  onCancel,
  isPending,
}: ReplyFormProps) => {
  const { t } = useLanguage();
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content, parentId);
    setContent('');
  };

  return (
    <div className="reply-form ms-4 mt-2 mb-3 p-2 border-start border-2">
      <TextareaAutosize
        className="form-control mb-2"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        minRows={2}
        maxRows={5}
        placeholder={t('common.write_reply')}
        disabled={isPending}
      />
      <div className="d-flex gap-2 justify-content-end">
        <button
          className="btn btn-sm btn-primary"
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
        >
          <FontAwesomeIcon icon={faSave} />{' '}
          {isPending ? t('common.loading') : t('common.save')}
        </button>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={onCancel}
          disabled={isPending}
        >
          <FontAwesomeIcon icon={faTimes} /> {t('common.cancel')}
        </button>
      </div>
    </div>
  );
};

export default ReplyForm;
