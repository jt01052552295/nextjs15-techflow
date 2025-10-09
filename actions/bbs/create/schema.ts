import { z } from 'zod';

export const FileDetailsSchema = z.object({
  idx: z.number().optional(),
  uid: z.string().optional(),
  pid: z.string().optional(),
  name: z.string().optional(),
  originalName: z.string(), // 원본 파일명
  url: z.string(), // 서버 경로
  previewUrl: z.string().optional(), // 미리보기 URL (선택)
  size: z.number(), // 파일 크기 (bytes)
  ext: z.string(), // 확장자 (예: pdf, jpg)
  type: z.string(), // MIME 타입 (예: image/jpeg)
});

export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string(),
    bdTable: z.string().min(1, {
      message: messages.required,
    }),
    userId: z.string().optional(),
    name: z.string().min(1, {
      message: messages.required,
    }),
    password: z.string().min(1, {
      message: messages.required,
    }),
    notice: z.boolean().optional(),
    secret: z.boolean().optional(),
    category: z.string().optional(),
    subject: z.string().min(1, {
      message: messages.required,
    }),
    content: z.string().min(1, {
      message: messages.required,
    }),
    contentA: z.string().optional().nullable(),
    ipAddress: z.string().optional(),
    link1: z.string().optional(),
    link2: z.string().optional(),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    files: z.array(FileDetailsSchema).optional(),
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
