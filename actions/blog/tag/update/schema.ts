import { z } from 'zod';

export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    cid: z.string().min(3, {
      message: messages.required,
    }),
    slug: z.string().min(3, {
      message: messages.required,
    }),
    name: z.string().min(3, {
      message: messages.required,
    }),
    desc: z.string().optional(),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
