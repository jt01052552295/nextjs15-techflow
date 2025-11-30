import { z } from 'zod';
import { PostCommentStatus } from '@prisma/client';

export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    // 게시글 ID (필수)
    postId: z.coerce.number().int().min(1, {
      message: messages.required,
    }),

    // 회원 ID (선택 - 비회원일 경우 null)
    userId: z.string().optional().nullable(),

    // 작성자 이름 (선택 - 비회원일 경우 필수일 수 있으나 DB상으론 nullable)
    author: z.string().optional().nullable(),

    // 댓글 내용 (필수)
    content: z.string().min(1, {
      message: messages.required,
    }),

    // 상태 (Enum)
    status: z
      .nativeEnum(PostCommentStatus)
      .optional()
      .default(PostCommentStatus.APPROVED),

    // IP 주소
    ipAddress: z.string().optional().nullable(),

    // 계층 구조 (대댓글)
    parentIdx: z.coerce.number().int().optional().nullable(),
    depth: z.coerce.number().int().optional().default(1),

    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
