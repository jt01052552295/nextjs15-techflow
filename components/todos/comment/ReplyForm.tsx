'use client';

import { useState, useTransition } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { createReplyAction } from '@/actions/todos/comment/reply';
import type { ITodosComment } from '@/types/todos';
import { toast } from 'sonner';
import { useLanguage } from '@/components/context/LanguageContext';

type Props = {
  todoId: string;
  parentIdx: number;
  onAdd: (reply: ITodosComment) => void;
};

export default function ReplyForm({ todoId, parentIdx, onAdd }: Props) {
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const required = t('common.form.required');

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.warning(required);
      return;
    }

    startTransition(async () => {
      const res = await createReplyAction({ todoId, parentIdx, content });
      if (res.status === 'success' && res.data) {
        onAdd(res.data);
        setContent('');
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="mb-3">
      <TextareaAutosize
        className="form-control mb-2"
        placeholder={required}
        minRows={1}
        maxRows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
        required
      />
      <button
        className="btn btn-sm btn-primary"
        onClick={handleSubmit}
        disabled={isPending}
      >
        {isPending ? t('common.loading') : t('common.save')}
      </button>
    </div>
  );
}
