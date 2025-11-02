import { z } from 'zod';

export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    platform: z.string().min(1, {
      message: messages.required,
    }),
    templateId: z.string().optional(),
    userId: z.string().uuid({
      message: messages.required,
    }),
    fcmToken: z.string().optional(),
    otCode: z.string().optional(),
    title: z.string().optional(),
    body: z.string().optional(),
    url: z.string().optional(),
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
