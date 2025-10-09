'use client';
import { useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faSpinner,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

interface CommentFormProps {
  initialContent?: string;
  onSubmit: (content: string, replyToId?: number | null) => void;
  isPending: boolean;
}

const CommentForm = ({
  initialContent = '',
  onSubmit,
  isPending,
}: CommentFormProps) => {
  const { t } = useLanguage();
  const [content, setContent] = useState(initialContent || '');
  const [isFocused, setIsFocused] = useState(false);

  // replyToId나 initialContent가 변경되면 내용 리셋
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
  };

  const charCount = content.length;
  const maxChars = 100;
  const isNearLimit = charCount > maxChars * 0.8;
  const isOverLimit = charCount > maxChars;

  return (
    <div className="comment-form card shadow-sm mb-4">
      <div className="card-header bg-white border-0 pb-0">
        <h6 className="mb-0 text-primary fw-bold">
          {t('common.write_comment')}
        </h6>
      </div>
      <div className="card-body pt-2">
        <div className="row g-0">
          <div className="col-auto d-none d-sm-block pe-3">
            {/* 아바타 영역 */}
            <div
              className="rounded-circle bg-light text-center d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
            >
              <FontAwesomeIcon icon={faUser} className="text-secondary" />
            </div>
          </div>
          <div className="col">
            {/* 댓글 입력 영역 */}
            <div
              className={`border rounded p-2 mb-2 ${isFocused ? 'border-primary shadow-sm' : 'border-secondary-subtle'}`}
            >
              <TextareaAutosize
                className="form-control border-0 p-0 shadow-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                minRows={2}
                maxRows={6}
                readOnly={isPending}
                style={{ resize: 'none' }}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center">
              {/* 글자 수 카운터 */}
              <div
                className={`small ${isNearLimit && !isOverLimit ? 'text-warning' : ''} ${isOverLimit ? 'text-danger' : 'text-muted'}`}
              >
                {charCount > 0 && (
                  <span>
                    {charCount} / {maxChars}
                  </span>
                )}
              </div>

              {/* 제출 버튼 */}
              <button
                className="btn btn-primary rounded-pill px-3"
                onClick={handleSubmit}
                disabled={isPending || !content.trim() || isOverLimit}
              >
                {isPending ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                    {t('common.save')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
