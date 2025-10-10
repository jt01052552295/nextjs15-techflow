import { z } from 'zod';

export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    author: z.string().optional(),
    parentIdx: z.any().transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      if (typeof val === 'number' && !isNaN(val)) return val;
      const parsed = parseInt(String(val), 10);
      return isNaN(parsed) ? null : parsed;
    }),
    bdTable: z.string().min(1, {
      message: messages.required,
    }),
    pid: z.string().min(3, {
      message: messages.required,
    }),
    content: z.string().min(3, {
      message: messages.required,
    }),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
