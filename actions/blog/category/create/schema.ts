import { z } from 'zod';

export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string(),
    code: z.string().min(1, {
      message: messages.required,
    }),
    name: z.string().min(3, {
      message: messages.required,
    }),
    slug: z.string().min(3, {
      message: messages.required,
    }),
    desc: z.string().optional(),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
