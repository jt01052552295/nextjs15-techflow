import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { formatMessage } from '@/lib/util';

export const FileDetailsSchema = z.object({
  idx: z.number().optional(),
  uid: z.string().optional(),
  userId: z.string().optional(),
  name: z.string().optional(),
  url: z.string().optional(),
  previewUrl: z.string().optional(),
});

export const profileSchema = (messages: Record<string, any>) =>
  z.object({
    id: z.string({
      message: formatMessage(messages.notExist, { column: 'ID' }),
    }),
    email: z
      .string()
      .min(1, { message: messages.required })
      .email({ message: messages.email }),
    phone: z.string().regex(/[0-9]/, { message: messages.number }),
    name: z
      .string()
      .min(2, {
        message: formatMessage(messages.txt.charCount, { charCount: '2' }),
      })
      .max(20, {
        message: formatMessage(messages.txt.maxChars, { maxChars: '20' }),
      })
      .regex(/^[a-zA-Z가-힣]+$/, { message: messages.nameCondition }),
    nick: z
      .string()
      .min(2, {
        message: formatMessage(messages.txt.charCount, { charCount: '2' }),
      })
      .max(20, {
        message: formatMessage(messages.txt.maxChars, { maxChars: '20' }),
      })
      .regex(/^[a-zA-Z가-힣]+$/, { message: messages.nameCondition }),
    role: z.enum(
      [UserRole.ADMIN, UserRole.EXTRA, UserRole.COMPANY, UserRole.USER],
      {
        message: messages.choice,
      },
    ),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    userProfile: z.array(FileDetailsSchema).optional(),
  });

export type ProfileType = z.infer<ReturnType<typeof profileSchema>>;
