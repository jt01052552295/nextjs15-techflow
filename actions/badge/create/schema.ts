import { z } from 'zod';

export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string(),
    bmType: z.string().min(3, {
      message: messages.required,
    }),
    bmCategory: z.string().min(3, {
      message: messages.required,
    }),
    bmLevel: z.string().min(3, {
      message: messages.required,
    }),
    bmThreshold: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    bmName: z.string().min(3, {
      message: messages.required,
    }),
    img1: z.string().nullable().optional(),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
