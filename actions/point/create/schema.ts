import { z } from 'zod';

export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    userId: z.string().min(3, {
      message: messages.required,
    }),
    point: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    status: z.string().min(3, {
      message: messages.required,
    }),
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
