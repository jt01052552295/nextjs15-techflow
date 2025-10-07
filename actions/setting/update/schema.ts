import { z } from 'zod';

export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    cid: z.string().min(3, {
      message: messages.required,
    }),
    userId: z.string().uuid({
      message: messages.required,
    }),
    gubun: z.string().optional(),
    kepcoContract: z.string().optional(),
    kw: z.preprocess((val) => parseFloat(val as string), z.number().optional()),
    powerFactor: z.preprocess((val) => Number(val), z.number().optional()),
    readingDate: z.preprocess((val) => Number(val), z.number().optional()),
    efficiency: z.preprocess((val) => Number(val), z.number().optional()),
    pushPoint: z.boolean().optional(),
    pushBill: z.boolean().optional(),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    skin: z.string().optional(),
    kepcoApi: z.boolean().optional(),
    kepcoMonthApi: z.boolean().optional(),
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
