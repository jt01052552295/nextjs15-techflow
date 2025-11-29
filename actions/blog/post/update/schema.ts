import { z } from 'zod';
import { PostStatus, PostVisibility } from '@prisma/client';

export const FileDetailsSchema = z.object({
  idx: z.number().optional(),
  uid: z.string().optional(),
  postId: z.string().optional(),
  name: z.string().optional(),
  originalName: z.string(), // 원본 파일명
  url: z.string(), // 서버 경로
  previewUrl: z.string().optional(), // 미리보기 URL (선택)
  size: z.number(), // 파일 크기 (bytes)
  ext: z.string(), // 확장자 (예: pdf, jpg)
  type: z.string(), // MIME 타입 (예: image/jpeg)
});

export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    cid: z.string().min(3, {
      message: messages.required,
    }),
    userId: z.string().min(2, {
      message: messages.required,
    }),

    // 카테고리: 선택 안 할 수도 있다고 가정 (null/optional 허용)
    categoryCode: z.string().optional().nullable(),

    content: z.string().min(1, {
      message: messages.required,
    }),

    // 링크는 선택사항
    linkUrl: z.string().url().optional().or(z.literal('')).nullable(),

    status: z.nativeEnum(PostStatus).optional().default(PostStatus.DRAFT),

    visibility: z
      .nativeEnum(PostVisibility)
      .optional()
      .default(PostVisibility.PUBLIC),

    isPinned: z.boolean().optional(),

    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    images: z.array(FileDetailsSchema).optional(),
    deleteFileUrls: z.array(z.string()).optional(),
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
