'use client';
import { useState } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import { ITodosCommentRow } from '@/types/todos';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThumbsUp,
  faReply,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import TextareaAutosize from 'react-textarea-autosize';
import ReplyList from './ReplyList';

interface CommentItemProps {
  todoId: string;
  comment: ITodosCommentRow;
  onReply: () => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: () => void;
  onLike: () => void;
}

const CommentItem = ({
  todoId,
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
}: CommentItemProps) => {
  const { t } = useLanguage();

  // 상태 관리
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);

  // 답글 토글
  const toggleReplies = () => {
    setShowReplies((prev) => !prev);
  };

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
            <div>
              <strong>{comment.idx}</strong>
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

              {!comment.parentIdx && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={onReply}
                >
                  <FontAwesomeIcon icon={faReply} /> {t('common.reply')}
                </button>
              )}
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

          {/* 답글 수가 있는 경우에만 답글 토글 버튼 표시 */}
          {!comment.parentIdx && comment.replyCount > 0 && (
            <div className="mt-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={toggleReplies}
              >
                <FontAwesomeIcon
                  icon={showReplies ? faChevronUp : faChevronDown}
                />{' '}
                {showReplies
                  ? t('common.hide_replies')
                  : t('common.show_replies', { count: comment.replyCount })}
              </button>
            </div>
          )}

          {/* 답글 목록 (토글 상태에 따라 표시) */}
          {showReplies && !comment.parentIdx && (
            <ReplyList
              todoId={todoId}
              parentId={comment.idx}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CommentItem;
