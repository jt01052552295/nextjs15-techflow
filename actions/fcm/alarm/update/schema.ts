import { z } from 'zod';

export const UpdateSchema = (messages: Record<string, any>) =>
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
    isRead: z.boolean().optional(),
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
