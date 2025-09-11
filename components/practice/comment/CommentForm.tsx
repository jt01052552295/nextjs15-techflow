'use client';
import { useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useLanguage } from '@/components/context/LanguageContext';

interface CommentFormProps {
  initialContent?: string;
  isReply?: boolean;
  replyToId?: number | null;
  onSubmit: (content: string, replyToId?: number | null) => void;
  onCancel?: () => void;
  isPending: boolean;
}

const CommentForm = ({
  initialContent = '',
  isReply = false,
  replyToId = null,
  onSubmit,
  onCancel,
  isPending,
}: CommentFormProps) => {
  const { t } = useLanguage();
  const [content, setContent] = useState(initialContent || '');

  // replyToId나 initialContent가 변경되면 내용 리셋
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, replyToId]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content, replyToId);
    setContent('');
  };

  return (
    <div className="comment-form mb-4">
      <h6>{isReply ? t('common.write_reply') : t('common.write_comment')}</h6>
      <div className="d-flex">
        <TextareaAutosize
          className="form-control me-2"
          placeholder={t('common.write_comment_placeholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          minRows={2}
          maxRows={5}
        />
        <div className="d-flex flex-column">
          <button
            className="btn btn-primary mb-1"
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
          >
            {isPending ? t('common.submitting') : t('common.submit')}
          </button>
          {isReply && onCancel && (
            <button className="btn btn-outline-secondary" onClick={onCancel}>
              {t('common.cancel')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
