'use client';

import { ITodosComment } from '@/types/todos';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import {
  faThumbsUp,
  faSave,
  faTimes,
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

dayjs.extend(relativeTime);
dayjs.locale('ko');

type Props = {
  reply: ITodosComment;
  editId: number | null;
  editContent: string;
  setEditContent: (val: string) => void;
  onEdit: (item: ITodosComment) => void;
  onEditCancel: () => void;
  onEditSave: (idx: number) => void;
  onDelete: (idx: number) => void;
  onToggleLike: (item: ITodosComment) => void;
  isPending: boolean;
};

export default function ReplyItem({
  reply,
  editId,
  editContent,
  setEditContent,
  onEdit,
  onEditCancel,
  onEditSave,
  onDelete,
  onToggleLike,
  isPending,
}: Props) {
  const isEditing = editId === reply.idx;

  return (
    <div className="border rounded p-2 mb-2 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <strong>{reply.author}</strong>
        <small className="text-muted">{dayjs(reply.createdAt).fromNow()}</small>
      </div>

      {isEditing ? (
        <div className="mb-2">
          <textarea
            className="form-control"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
          />
          <div className="mt-1 d-flex gap-2 justify-content-end">
            <button
              className="btn btn-sm btn-success"
              onClick={() => onEditSave(reply.idx)}
              disabled={isPending}
            >
              <FontAwesomeIcon icon={faSave} /> 저장
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={onEditCancel}
              disabled={isPending}
            >
              <FontAwesomeIcon icon={faTimes} /> 취소
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-2">{reply.content}</p>
      )}

      <div className="d-flex gap-3">
        <button
          className={`btn btn-sm ${reply.liked ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onToggleLike(reply)}
          disabled={isPending}
        >
          <FontAwesomeIcon icon={faThumbsUp} /> {reply.likeCount}
        </button>

        {!isEditing && (
          <>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onEdit(reply)}
              disabled={isPending}
            >
              <FontAwesomeIcon icon={faPen} /> 수정
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(reply.idx)}
              disabled={isPending}
            >
              <FontAwesomeIcon icon={faTrash} /> 삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
}
