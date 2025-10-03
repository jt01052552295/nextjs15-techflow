import { z } from 'zod';

export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string({
      message: messages.required,
    }),
    cid: z.string({
      message: messages.required,
    }),
    CNFname: z.string().min(1, {
      message: messages.required,
    }),
    CNFvalue: z.string().optional().nullable(), // 설정 값 (한국어)
    CNFvalue_en: z.string().optional().nullable(), // 설정 값 (영어)
    CNFvalue_ja: z.string().optional().nullable(), // 설정 값 (일본어)
    CNFvalue_zh: z.string().optional().nullable(), // 설정 값 (중국어)
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
