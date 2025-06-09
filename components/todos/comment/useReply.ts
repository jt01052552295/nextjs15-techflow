'use client';

import { useState, useTransition, useCallback } from 'react';
import { ITodosComment } from '@/types/todos';
import { toast } from 'sonner';
import {
  deleteReplyAction,
  updateReplyAction,
} from '@/actions/todos/comment/reply';
import { toggleCommentLikeAction } from '@/actions/todos/comment/like';

export function useReply(
  replies: ITodosComment[],
  setReplies: React.Dispatch<React.SetStateAction<ITodosComment[]>>,
) {
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // ✅ 등록 후 추가
  const addReply = useCallback(
    (reply: ITodosComment) => {
      setReplies((prev) => [...prev, reply]);
    },
    [setReplies],
  );

  // ✅ 수정 시작
  const startEdit = (item: ITodosComment) => {
    setEditId(item.idx);
    setEditContent(item.content);
  };

  // ✅ 수정 취소
  const cancelEdit = () => {
    setEditId(null);
    setEditContent('');
  };

  // ✅ 수정 저장
  const saveEdit = async (idx: number) => {
    const target = replies.find((r) => r.idx === idx);
    if (!target) return;

    const response = await updateReplyAction({
      uid: target.uid,
      todoId: target.todoId,
      parentIdx: target.parentIdx,
      content: editContent,
    });

    if (response.status === 'success' && response.data) {
      toast.success(response.message);
      setReplies((prev) =>
        prev.map((r) =>
          r.idx === idx ? { ...r, content: response.data.content } : r,
        ),
      );
      cancelEdit();
    } else {
      toast.error(response.message);
    }
  };

  // ✅ 삭제 요청
  const confirmDelete = (idx: number) => setDeleteId(idx);
  const cancelDelete = () => setDeleteId(null);

  // ✅ 삭제 실행
  const deleteReply = async () => {
    const target = replies.find((r) => r.idx === deleteId);
    if (!target) return;

    const response = await deleteReplyAction({
      uid: target.uid,
      parentIdx: target.parentIdx,
    });

    if (response.status === 'success') {
      toast.success(response.message);
      setReplies((prev) => prev.filter((r) => r.idx !== deleteId));
    } else {
      toast.error(response.message);
    }
    cancelDelete();
  };

  // ✅ 좋아요 토글
  const toggleLike = (reply: ITodosComment) => {
    startTransition(async () => {
      const res = await toggleCommentLikeAction(reply.idx);
      if (res.status === 'success') {
        setReplies((prev) =>
          prev.map((r) =>
            r.idx === reply.idx
              ? {
                  ...r,
                  liked: res.liked ?? false,
                  likeCount: res.likeCount ?? r.likeCount,
                }
              : r,
          ),
        );
      }
    });
  };

  return {
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
  };
}
