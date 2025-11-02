import { z } from 'zod';

export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    userId: z.string().uuid({
      message: messages.required,
    }),
    token: z.string().min(1, {
      message: messages.required,
    }),
    platform: z.enum(['android', 'ios', 'web']).default('android'),
    deviceId: z.string().optional(),
    appVersion: z.string().optional(),
    deviceInfo: z.string().optional(),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
