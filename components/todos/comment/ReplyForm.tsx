'use client';

import { useState, useTransition } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { createReplyAction } from '@/actions/todos/comment/reply';
import type { ITodosComment } from '@/types/todos';
import { toast } from 'sonner';

type Props = {
  todoId: string;
  parentIdx: number;
  onAdd: (reply: ITodosComment) => void;
};

export default function ReplyForm({ todoId, parentIdx, onAdd }: Props) {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.warning('내용을 입력해주세요');
      return;
    }

    startTransition(async () => {
      const res = await createReplyAction({ todoId, parentIdx, content });
      if (res.status === 'success' && res.data) {
        onAdd(res.data);
        setContent('');
      } else {
        toast.error(res.message || '등록 실패');
      }
    });
  };

  return (
    <div className="mb-3">
      <TextareaAutosize
        className="form-control mb-2"
        placeholder="답글을 입력하세요"
        minRows={2}
        maxRows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
      />
      <button
        className="btn btn-sm btn-primary"
        onClick={handleSubmit}
        disabled={isPending}
      >
        {isPending ? '등록 중...' : '답글 등록'}
      </button>
    </div>
  );
}
