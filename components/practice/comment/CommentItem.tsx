'use client';
import { useState, useEffect } from 'react';
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
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import TextareaAutosize from 'react-textarea-autosize';
import ReplyList from './ReplyList';
import ReplyForm from './ReplyForm';
import { maskingName, maskingEmail } from '@/lib/util';
import Image from 'next/image';

interface CommentItemProps {
  todoId: string;
  comment: ITodosCommentRow;
  onReply: (commentId: number) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (comment: ITodosCommentRow) => void;
  onLike: (commentId: number) => void;
  isReplyFormOpen: boolean;
  onReplySubmit: (content: string, parentId: number) => void;
  onReplyCancel: () => void;
  replyFormPending: boolean;
  // 새로운 props 추가
  onReplyDelete?: (reply: ITodosCommentRow) => void; // 답글 삭제용
  onReplyLike?: (replyId: number) => void; // 답글 좋아요용
}

const CommentItem = ({
  todoId,
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  isReplyFormOpen,
  onReplySubmit,
  onReplyCancel,
  replyFormPending,
  onReplyDelete,
  onReplyLike,
}: CommentItemProps) => {
  const { t } = useLanguage();

  // 상태 관리
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);

  const staticUrl = process.env.NEXT_PUBLIC_STATIC_URL || '';
  const profile = comment.user?.profile?.[0];
  const profileImageUrl = profile?.url ? `${staticUrl}${profile.url}` : null;

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

  // 답글 버튼 클릭 시 - 답글폼과 목록을 함께 토글
  const handleReplyClick = () => {
    console.log(comment.idx, isReplyFormOpen);
    onReply(comment.idx);
    setShowReplies(isReplyFormOpen ? false : true);
  };

  useEffect(() => {
    if (isReplyFormOpen) {
      setShowReplies(true);
    }
  }, [isReplyFormOpen]);

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
                onClick={() => onLike(comment.idx)}
              >
                <FontAwesomeIcon icon={faThumbsUp} /> {comment.likeCount || 0}
              </button>

              {!comment.parentIdx && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleReplyClick}
                >
                  <FontAwesomeIcon icon={faReply} />
                  {isReplyFormOpen
                    ? t('common.hide_replies')
                    : t('common.reply')}
                  {comment.replyCount > 0 &&
                    !isReplyFormOpen &&
                    ` (${comment.replyCount})`}
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
                onClick={() => onDelete(comment)}
              >
                <FontAwesomeIcon icon={faTrash} /> {t('common.delete')}
              </button>
            </div>
          </div>

          {/* 답글 작성 폼 (해당 댓글이 답글 작성 대상일 때만) */}
          {isReplyFormOpen && !comment.parentIdx && (
            <ReplyForm
              parentId={comment.idx}
              onSubmit={onReplySubmit}
              onCancel={() => {
                onReplyCancel();
                setShowReplies(false);
              }}
              isPending={replyFormPending}
            />
          )}

          {/* 답글 목록 (토글 상태에 따라 표시) */}
          {showReplies && !comment.parentIdx && comment.replyCount > 0 && (
            <ReplyList
              todoId={todoId}
              parentId={comment.idx}
              onEdit={onEdit}
              onDelete={onReplyDelete || ((reply) => onDelete(reply))} // onReplyDelete가 있으면 사용, 없으면 기본 함수 사용
              onLike={onReplyLike || ((replyId) => onLike(replyId))} // onReplyLike가 있으면 사용, 없으면 기본 함수 사용
            />
          )}
        </>
      )}
    </div>
  );
};

export default CommentItem;
