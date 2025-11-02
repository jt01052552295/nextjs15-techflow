import { z } from 'zod';

export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    type: z.string().min(1, {
      message: messages.required,
    }),
    activity: z.string().min(1, {
      message: messages.required,
    }),
    title: z.string().optional(),
    body: z.string().optional(),
    message: z.string().optional(),
    titleEn: z.string().optional(),
    bodyEn: z.string().optional(),
    messageEn: z.string().optional(),
    targetLink: z.string().default(''),
    webTargetLink: z.string().default(''),
    img1: z.string().default(''),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
