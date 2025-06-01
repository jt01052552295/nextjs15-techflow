'use client';

import CommentWrite from './CommentWrite';
import CommentList from './CommentList';
import { useComment } from './useComment';
import { ITodosComment } from '@/types/todos';
import CommentDeleteModal from './CommentDeleteModal';

type Props = {
  todoId: string;
  initialComments?: ITodosComment[];
};

export default function CommentSection({
  todoId,
  initialComments = [],
}: Props) {
  const {
    comments,
    editId,
    editContent,
    setEditContent,
    confirmDelete,
    cancelDelete,
    deleteComment,
    deleteId,
    startEdit,
    cancelEdit,
    saveEdit,
    addComment,
  } = useComment(initialComments);

  return (
    <div>
      <CommentWrite todoId={todoId} onSuccess={addComment} />
      <CommentList
        comments={comments}
        onEdit={startEdit}
        onDelete={confirmDelete}
        editId={editId}
        editContent={editContent}
        setEditContent={setEditContent}
        onEditSave={saveEdit}
        onEditCancel={cancelEdit}
      />
      <CommentDeleteModal
        visible={deleteId !== null}
        onCancel={cancelDelete}
        onConfirm={deleteComment}
      />
    </div>
  );
}
