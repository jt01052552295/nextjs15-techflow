'use client';
import { useState, useTransition } from 'react';
import { ITodosComment } from '@/types/todos';
import TextareaAutosize from 'react-textarea-autosize';
import { toggleCommentLikeAction } from '@/actions/todos/comment/like';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import CommentReplies from './CommentReplies';

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
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(item.liked ?? false); // 추후 item.liked가 필요
  const [likeCount, setLikeCount] = useState(item.likeCount ?? 0);

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
      <div className="d-flex justify-content-between align-items-center mb-1">
        <strong>{item.author}</strong>
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
              저장
            </button>
            <button className="btn btn-sm btn-secondary" onClick={onEditCancel}>
              취소
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
                ? '답글 숨기기'
                : item.replyCount > 0
                  ? `답글 ${item.replyCount}개 보기`
                  : '답글 달기'}
            </button>

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => onEdit(item)}
            >
              수정
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(item.idx)}
            >
              삭제
            </button>
          </div>

          {showReplies && (
            <CommentReplies todoId={item.todoId} parentIdx={item.idx} />
          )}
        </>
      )}
    </div>
  );
}
