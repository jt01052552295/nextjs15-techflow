import { z } from 'zod';

export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    userId: z.string().uuid({
      message: messages.required,
    }),
    name: z.string().min(3, {
      message: messages.required,
    }),
    address: z.string().optional(), // 주소 선택 사항
    phone: z.string().optional(), // 전화번호 선택 사항
    email: z
      .string()
      .email({
        message: messages.email,
      })
      .optional(),
    custNo: z.string().optional(), // 고객 번호 선택 사항
    bizNo: z.string().optional(), // 사업자 등록 번호 선택 사항
    corpNo: z.string().optional(), // 법인 번호 선택 사항
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
