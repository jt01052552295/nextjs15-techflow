'use client';

import { ITodosComment } from '@/types/todos';
import TextareaAutosize from 'react-textarea-autosize';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

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
          <div className="d-flex gap-2">
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
        </>
      )}
    </div>
  );
}
