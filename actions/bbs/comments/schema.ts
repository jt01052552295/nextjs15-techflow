import { z } from 'zod';

export const CommentSchema = (messages: Record<string, any>) =>
  z.object({
    idx: z.number().optional(),
    uid: z.string().optional(),
    author: z.string().optional(),
    parentIdx: z.number().int().nullable().optional(),
    bdTable: z.string().min(1, {
      message: messages.required,
    }),
    pid: z.string().min(3, {
      message: messages.required,
    }),
    content: z.string().min(3, {
      message: messages.required,
    }),
  });

export type CommentType = z.infer<ReturnType<typeof CommentSchema>>;
