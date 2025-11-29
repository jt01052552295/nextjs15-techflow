import { z } from 'zod';
import { PostStatus, PostVisibility } from '@prisma/client';

export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string(),

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
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
