import { z } from 'zod';

export const CommentTodoSchema = (messages: Record<string, any>) =>
  z.object({
    idx: z.number().optional(),
    uid: z.string().optional(),
    todoId: z.string().min(3, {
      message: messages.required,
    }),
    content: z.string().min(3, {
      message: messages.required,
    }),
  });

export type CommentTodoType = z.infer<ReturnType<typeof CommentTodoSchema>>;
