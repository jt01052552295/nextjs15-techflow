'use client';

import TextareaAutosize from 'react-textarea-autosize';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import useFormUtils from '@/hooks/useFormUtils';
import { useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import {
  CommentTodoType,
  CommentTodoSchema,
} from '@/actions/todos/comment/schema';
import { createCommentAction } from '@/actions/todos/comment';
import { useLanguage } from '@/components/context/LanguageContext';
import { ITodosComment } from '@/types/todos';

interface Props {
  todoId: string;
  onSuccess?: (newComment: ITodosComment) => void;
}

export default function CommentWrite({ todoId, onSuccess }: Props) {
  const { dictionary, t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    watch,
    reset,
  } = useForm<CommentTodoType>({
    mode: 'onChange',
    resolver: zodResolver(CommentTodoSchema(dictionary.common.form)),
    defaultValues: {
      todoId,
      content: '',
    },
  });

  const { handleInputChange, getInputClass } = useFormUtils<CommentTodoType>({
    trigger,
    errors,
    watch,
    setErrorMessage: () => {},
  });

  useEffect(() => {
    if (errors) {
      Object.values(errors).forEach((err) => {
        if (err?.message) toast.error(err.message);
      });
    }
  }, [errors]);

  const onSubmit = (data: CommentTodoType) => {
    startTransition(async () => {
      try {
        const response = await createCommentAction(data);
        if (response.status === 'success') {
          toast.success(response.message);
          reset();
          if (onSuccess) onSuccess(response.data);
        } else {
          toast.error(response.message);
        }
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : String(err));
      }
    });
  };

  if (!todoId) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
      <input type="hidden" {...register('todoId')} value={todoId} />

      <div className="mb-3">
        <TextareaAutosize
          className={`form-control ${getInputClass('content')}`}
          maxRows={3}
          {...register('content', {
            onChange: () => handleInputChange('content'),
            onBlur: () => handleInputChange('content'),
          })}
          readOnly={isPending}
        />
        {errors.content?.message && (
          <div className="invalid-feedback">{errors.content.message}</div>
        )}
        {!errors.content && (
          <div className="valid-feedback">{t('common.form.valid')}</div>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isPending || !isValid}
      >
        {isPending ? t('common.loading') : t('common.save')}
      </button>
    </form>
  );
}
