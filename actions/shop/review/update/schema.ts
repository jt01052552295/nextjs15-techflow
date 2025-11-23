import { z } from 'zod';

export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    orderId: z.coerce.number().int().optional().nullable(), // nullable
    itemId: z.coerce.number().int().min(1, {
      message: messages.required,
    }),
    userId: z.string().optional().nullable(),

    // 작성자 정보
    name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),

    // 리뷰 내용
    subject: z.string().min(1, {
      message: messages.required,
    }),
    content: z.string().min(1, {
      message: messages.required,
    }),

    // 평점 (1~5점)
    score: z.coerce
      .number()
      .int()
      .min(1, { message: messages.required })
      .max(5, { message: messages.required }),

    // 플래그들
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    isSecret: z.boolean().optional(),
    isAdmin: z.boolean().optional(),
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
