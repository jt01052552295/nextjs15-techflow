'use client';
import { useEffect } from 'react';
import { useReply } from './useReply';
import { useReplyList } from './useReplyList';
import ReplyForm from './ReplyForm';
import ReplyList from './ReplyList';
import ReplyDeleteModal from './ReplyDeleteModal';

type Props = {
  todoId: string;
  parentIdx: number;
  onReplyCountChange?: (count: number) => void;
};

export default function CommentReplies({
  todoId,
  parentIdx,
  onReplyCountChange,
}: Props) {
  const { replies, setReplies, loading, hasMore, loadMore } = useReplyList({
    todoId,
    parentIdx,
  });

  const {
    editId,
    editContent,
    setEditContent,
    startEdit,
    cancelEdit,
    saveEdit,
    confirmDelete,
    cancelDelete,
    deleteReply,
    deleteId,
    addReply,
    toggleLike,
    isPending,
  } = useReply(replies, setReplies);

  useEffect(() => {
    onReplyCountChange?.(replies.length); // ✅ 초기값 반영
  }, [replies.length]);

  return (
    <div className="mt-2 ms-4 border-start ps-3">
      {/* ✅ 답글 작성폼 */}
      <ReplyForm todoId={todoId} parentIdx={parentIdx} onAdd={addReply} />

      {/* ✅ 답글 목록 */}
      <ReplyList
        replies={replies}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onEdit={startEdit}
        onDelete={confirmDelete}
        editId={editId}
        editContent={editContent}
        setEditContent={setEditContent}
        onEditSave={saveEdit}
        onEditCancel={cancelEdit}
        onToggleLike={toggleLike}
        isPending={isPending}
      />

      {/* 삭제 모달 */}
      <ReplyDeleteModal
        visible={deleteId !== null}
        onCancel={cancelDelete}
        onConfirm={deleteReply}
      />
    </div>
  );
}
