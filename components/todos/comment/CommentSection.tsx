'use client';

import { useState } from 'react';
import CommentWrite from './CommentWrite';
import CommentList from './CommentList';
import { useComment } from './useComment';
import CommentDeleteModal from './CommentDeleteModal';
import { useCommentList } from './useCommentList'; // ← 새로 만들 훅
import CommentSortBar from './CommentSortBar';

type Props = {
  todoId: string;
};

export default function CommentSection({ todoId }: Props) {
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');

  const { comments, setComments, loadMore, hasMore, isLoading, totalCount } =
    useCommentList({
      todoId,
      orderBy: sort,
    });

  const {
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
  } = useComment(comments, setComments, setSort); // setSort는 새로 등록시 최신순으로 전환할 때 쓸 수 있음
  return (
    <div>
      <CommentWrite todoId={todoId} onSuccess={addComment} />

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6>
          댓글 <span className="text-primary">{totalCount}</span>개
        </h6>
        <CommentSortBar orderBy={sort} onChange={setSort} />
      </div>

      <CommentList
        comments={comments}
        onEdit={startEdit}
        onDelete={confirmDelete}
        editId={editId}
        editContent={editContent}
        setEditContent={setEditContent}
        onEditSave={saveEdit}
        onEditCancel={cancelEdit}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
      />
      <CommentDeleteModal
        visible={deleteId !== null}
        onCancel={cancelDelete}
        onConfirm={deleteComment}
      />
    </div>
  );
}
