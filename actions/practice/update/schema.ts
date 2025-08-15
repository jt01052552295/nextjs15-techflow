import { z } from 'zod';

export const FileDetailsSchema = z.object({
  idx: z.number().optional(),
  uid: z.string().optional(),
  todoId: z.string().optional(),
  name: z.string().optional(),
  originalName: z.string(), // 원본 파일명
  url: z.string(), // 서버 경로
  previewUrl: z.string().optional(), // 미리보기 URL (선택)
  size: z.number(), // 파일 크기 (bytes)
  ext: z.string(), // 확장자 (예: pdf, jpg)
  type: z.string(), // MIME 타입 (예: image/jpeg)
});

export const OptionDetailsSchema = (messages: Record<string, any>) =>
  z.object({
    idx: z.number().optional(),
    uid: z.string().optional(),
    todoId: z.string().optional(),
    name: z.string().trim().min(1, {
      message: messages.required,
    }),
    age: z.coerce.number().min(0, {
      message: messages.numeric,
    }),
    gender: z.string().min(1, {
      message: messages.required,
    }),
    _delete: z.boolean().optional(),
  });

export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    cid: z.string().min(3, {
      message: messages.required,
    }),
    name: z.string().min(3, {
      message: messages.required,
    }),
    email: z.string().email({
      message: messages.required,
    }),
    gender: z.string().optional(),
    img1: z.string().optional(),
    content: z.string().optional().nullable(),
    content2: z.string().optional().nullable(),
    ipAddress: z.string().optional(),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    todoFile: z.array(FileDetailsSchema).optional(),
    todoOption: z.array(OptionDetailsSchema(messages)).optional(),
    deleteOptionUids: z.array(z.string()).optional(),
    deleteFileUrls: z.array(z.string()).optional(),
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
