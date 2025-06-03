'use client';

import { useState, useCallback } from 'react';
import { ITodosComment } from '@/types/todos';
import { toast } from 'sonner';
import {
  updateCommentAction,
  deleteCommentAction,
} from '@/actions/todos/comment';

export function useComment(
  comments: ITodosComment[],
  setComments: React.Dispatch<React.SetStateAction<ITodosComment[]>>, // 정확한 타입 지정
  setSort?: (sort: 'latest' | 'popular') => void,
) {
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 댓글 등록
  const addComment = useCallback(
    (comment: ITodosComment) => {
      setComments((prev: ITodosComment[]) => [comment, ...prev]);

      if (setSort) setSort('latest');
    },
    [setComments, setSort],
  );

  // 수정 시작
  const startEdit = (item: ITodosComment) => {
    setEditId(item.idx);
    setEditContent(item.content);
  };

  // 수정 취소
  const cancelEdit = () => {
    setEditId(null);
    setEditContent('');
  };

  // 수정 저장
  const saveEdit = async (idx: number) => {
    const target = comments.find((c) => c.idx === idx);
    if (!target) return;

    const response = await updateCommentAction({
      uid: target.uid,
      todoId: target.todoId,
      content: editContent,
    });

    if (response.status === 'success' && response.data) {
      toast.success(response.message);
      setComments((prev: ITodosComment[]) =>
        prev.map((c) =>
          c.idx === idx ? { ...c, content: response.data.content } : c,
        ),
      );
      cancelEdit();
    } else {
      toast.error(response.message);
    }
  };

  // 삭제 요청
  const confirmDelete = (idx: number) => setDeleteId(idx);
  const cancelDelete = () => setDeleteId(null);

  const deleteComment = async () => {
    const target = comments.find((c) => c.idx === deleteId);
    if (!target) return;

    const response = await deleteCommentAction({ uid: target.uid });
    if (response.status === 'success') {
      toast.success(response.message);
      setComments((prev: ITodosComment[]) =>
        prev.filter((c) => c.idx !== deleteId),
      );
    } else {
      toast.error(response.message);
    }
    cancelDelete();
  };

  return {
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
  };
}
