'use client';

import CommentItem from './CommentItem';
import { ITodosComment } from '@/types/todos';

type Props = {
  comments: ITodosComment[];
  editId: number | null;
  editContent: string;
  setEditContent: (value: string) => void;
  onEdit: (item: ITodosComment) => void;
  onEditSave: (idx: number) => void;
  onEditCancel: () => void;
  onDelete: (idx: number) => void;
};

export default function CommentList({
  comments,
  editId,
  editContent,
  setEditContent,
  onEdit,
  onEditSave,
  onEditCancel,
  onDelete,
}: Props) {
  return (
    <ul className="list-group">
      {comments.length > 0 ? (
        comments.map((item) => (
          <CommentItem
            key={item.idx}
            item={item}
            isEditing={editId === item.idx}
            editContent={editContent}
            setEditContent={setEditContent}
            onEdit={onEdit}
            onEditSave={onEditSave}
            onEditCancel={onEditCancel}
            onDelete={onDelete}
          />
        ))
      ) : (
        <li className="list-group-item text-muted">댓글이 없습니다.</li>
      )}
    </ul>
  );
}
