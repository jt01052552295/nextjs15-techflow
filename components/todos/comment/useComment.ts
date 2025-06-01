'use client';

import { useState, useTransition, useCallback } from 'react';
import { ITodosComment } from '@/types/todos';
import { toast } from 'sonner';
import {
  createCommentAction,
  updateCommentAction,
  deleteCommentAction,
} from '@/actions/todos/comment';

export function useComment(initialComments: ITodosComment[] = []) {
  const [comments, setComments] = useState<ITodosComment[]>(initialComments);
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const addComment = useCallback((comment: ITodosComment) => {
    setComments((prev) => [comment, ...prev]);
  }, []);

  const startEdit = (item: ITodosComment) => {
    setEditId(item.idx);
    setEditContent(item.content);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditContent('');
  };

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
      setComments((prev) =>
        prev.map((c) =>
          c.idx === idx ? { ...c, content: response.data.content } : c,
        ),
      );
      cancelEdit();
    } else {
      toast.error(response.message);
    }
  };

  const confirmDelete = (idx: number) => {
    setDeleteId(idx);
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const deleteComment = async () => {
    const target = comments.find((c) => c.idx === deleteId);
    if (!target) return;

    const response = await deleteCommentAction({ uid: target.uid });
    if (response.status === 'success') {
      toast.success(response.message);
      setComments((prev) => prev.filter((c) => c.idx !== deleteId));
    } else {
      toast.error(response.message);
    }
    cancelDelete();
  };

  return {
    comments,
    addComment,
    editId,
    editContent,
    setEditContent,
    setEditId,
    isPending,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteId,
    confirmDelete,
    cancelDelete,
    deleteComment,
  };
}
