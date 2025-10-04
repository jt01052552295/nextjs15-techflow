import { z } from 'zod';

export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string(),
    title: z.string().min(1, {
      message: messages.required,
    }),
    content: z.string().optional().nullable(),
    posX: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    posY: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    startTime: z.string(),
    endTime: z.string(),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
