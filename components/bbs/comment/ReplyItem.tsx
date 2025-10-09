'use client';
import { useState } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import { IBBSCommentRow } from '@/types/comment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThumbsUp,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import TextareaAutosize from 'react-textarea-autosize';
import { maskingName, maskingEmail } from '@/lib/util';
import Image from 'next/image';

interface CommentItemProps {
  comment: IBBSCommentRow;
  onEdit: (commentId: string, content: string) => void;
  onDelete: () => void;
  onLike: () => void;
}

const ReplyItem = ({ comment, onEdit, onDelete, onLike }: CommentItemProps) => {
  const { t } = useLanguage();

  // 상태 관리
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  // 수정 제출
  const handleEditSubmit = () => {
    if (editContent.trim()) {
      onEdit(comment.uid, editContent);
      setIsEditing(false);
    }
  };

  // 수정 취소
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const staticUrl = process.env.NEXT_PUBLIC_STATIC_URL || '';
  const profile = comment.user?.profile?.[0];
  const profileImageUrl = profile?.url ? `${staticUrl}${profile.url}` : null;

  return (
    <div className="comment-item p-3 mb-3 border-bottom">
      {isEditing ? (
        <div className="edit-form">
          <TextareaAutosize
            className="form-control mb-2"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            minRows={2}
            maxRows={5}
          />
          <div className="d-flex gap-2 justify-content-end">
            <button
              className="btn btn-sm btn-primary"
              onClick={handleEditSubmit}
            >
              <FontAwesomeIcon icon={faSave} /> {t('common.save')}
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={handleEditCancel}
            >
              <FontAwesomeIcon icon={faTimes} /> {t('common.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between">
            <div className="d-flex align-items-center gap-2">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt={comment.user?.name || ''}
                  width={32}
                  height={32}
                  className="rounded-circle border"
                />
              ) : (
                <div
                  className="rounded-circle bg-light text-center d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px' }}
                >
                  <FontAwesomeIcon icon={faUser} className="text-secondary" />
                </div>
              )}

              <div className="d-flex gap-1">
                <span className="fw-semibold">
                  {maskingName(comment.user?.name ?? '')}
                </span>
                <small className="text-muted">
                  {maskingEmail(comment.user?.email ?? '')}
                </small>
              </div>
            </div>
            <small className="text-muted">{comment.createdAt}</small>
          </div>

          <div className="mt-2 mb-3">{comment.content}</div>

          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={onLike}
              >
                <FontAwesomeIcon icon={faThumbsUp} /> {comment.likeCount || 0}
              </button>
            </div>

            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setIsEditing(true)}
              >
                <FontAwesomeIcon icon={faEdit} /> {t('common.edit')}
              </button>

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={onDelete}
              >
                <FontAwesomeIcon icon={faTrash} /> {t('common.delete')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReplyItem;
