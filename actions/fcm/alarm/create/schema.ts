import { z } from 'zod';

export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    userId: z.string().uuid({
      message: messages.required,
    }),
    templateId: z.string().default(''),
    message: z.string().nullable().optional(),
    url: z.string().default(''),
    isRead: z.boolean().default(false),
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
