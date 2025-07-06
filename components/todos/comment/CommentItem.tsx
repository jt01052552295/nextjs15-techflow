'use client';
import { useState, useTransition } from 'react';
import { ITodosComment } from '@/types/todos';
import TextareaAutosize from 'react-textarea-autosize';
import { toggleCommentLikeAction } from '@/actions/todos/comment/like';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import CommentReplies from './CommentReplies';
import { maskingName, maskingEmail } from '@/lib/util';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/components/context/LanguageContext';

dayjs.extend(relativeTime);
dayjs.locale('ko');

type Props = {
  item: ITodosComment;
  isEditing: boolean;
  editContent: string;
  setEditContent: (value: string) => void;
  onEdit: (item: ITodosComment) => void;
  onEditSave: (idx: number) => void;
  onEditCancel: () => void;
  onDelete: (idx: number) => void;
};

export default function CommentItem({
  item,
  isEditing,
  editContent,
  setEditContent,
  onEdit,
  onEditSave,
  onEditCancel,
  onDelete,
}: Props) {
  const { t } = useLanguage();
  const [showReplies, setShowReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(item.replyCount);

  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(item.liked ?? false); // 추후 item.liked가 필요
  const [likeCount, setLikeCount] = useState(item.likeCount ?? 0);

  const staticUrl = process.env.NEXT_PUBLIC_STATIC_URL || '';
  const profile = item.user?.profile?.[0];
  const profileImageUrl = profile?.url ? `${staticUrl}${profile.url}` : null;

  const handleToggleLike = () => {
    startTransition(async () => {
      const res = await toggleCommentLikeAction(item.idx);
      if (res.status === 'success') {
        setLiked(res.liked ?? false);
        setLikeCount(res.likeCount ?? 0);
      }
    });
  };

  const toggleReplies = () => setShowReplies((prev) => !prev);

  return (
    <div className="border rounded p-3 mb-2 bg-light-subtle">
      <div className="d-flex justify-content-between align-items-center mb-2">
        {/* 프로필 + 이름/이메일 */}
        <div className="d-flex align-items-center gap-2">
          {profileImageUrl ? (
            <Image
              src={profileImageUrl}
              alt={item.user?.name || ''}
              width={32}
              height={32}
              className="rounded-circle border"
            />
          ) : (
            <div
              className="avatar-placeholder rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white border"
              style={{ width: 32, height: 32 }}
            >
              <FontAwesomeIcon icon={faUser} />
            </div>
          )}

          <div className="d-flex gap-1">
            <span className="fw-semibold">
              {maskingName(item.user?.name ?? '')}
            </span>
            <small className="text-muted">
              {maskingEmail(item.user?.email ?? '')}
            </small>
          </div>
        </div>

        {/* 작성일 */}
        <small className="text-muted">{dayjs(item.createdAt).fromNow()}</small>
      </div>

      {isEditing ? (
        <>
          <TextareaAutosize
            className="form-control mb-2"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxRows={3}
          />
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => onEditSave(item.idx)}
            >
              {t('common.save')}
            </button>
            <button className="btn btn-sm btn-secondary" onClick={onEditCancel}>
              {t('common.cancel')}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-2">{item.content}</p>
          <div className="d-flex gap-2 align-items-center mb-2">
            <button
              className={`btn btn-sm ${
                liked ? 'btn-primary' : 'btn-outline-primary'
              }`}
              onClick={handleToggleLike}
              disabled={isPending}
            >
              {liked ? '❤️' : '🤍'} {likeCount}
            </button>

            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={toggleReplies}
            >
              {showReplies
                ? `${t('common.reply')} ${replyCount}`
                : `${t('common.reply')} ${replyCount}`}
            </button>

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => onEdit(item)}
            >
              {t('common.edit')}
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(item.idx)}
            >
              {t('common.delete')}
            </button>
          </div>

          {showReplies && (
            <CommentReplies
              todoId={item.todoId}
              parentIdx={item.idx}
              onReplyCountChange={(count) => setReplyCount(count)}
            />
          )}
        </>
      )}
    </div>
  );
}
