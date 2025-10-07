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

export const CreateSchema = (messages: Record<string, any>) =>
  z
    .object({
      id: z.string().min(3, {
        message: messages.required,
      }),
      email: z
        .string()
        .min(1, { message: messages.required })
        .email({ message: messages.email }),
      password: z
        .string()
        .regex(/[a-z]/, { message: messages.lowercase })
        .regex(/[0-9]/, { message: messages.number })
        .regex(/[^a-zA-Z0-9]/, { message: messages.special })
        .min(6, {
          message: formatMessage(messages.txt.charCount, { charCount: '6' }),
        }),
      re_password: z
        .string()
        .regex(/[a-z]/, { message: messages.lowercase })
        .regex(/[0-9]/, { message: messages.number })
        .regex(/[^a-zA-Z0-9]/, { message: messages.special })
        .min(6, {
          message: formatMessage(messages.txt.charCount, { charCount: '6' }),
        }),
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
      phone: z.string().regex(/[0-9]/, { message: messages.number }),
      level: z.string({ required_error: messages.required }).min(1, {
        message: messages.required,
      }),
      role: z.enum(
        [UserRole.ADMIN, UserRole.EXTRA, UserRole.COMPANY, UserRole.USER],
        {
          message: messages.choice,
        },
      ),
      isUse: z.boolean().optional(),
      isVisible: z.boolean().optional(),
      profile: z.array(FileDetailsSchema).optional(),
    })
    .superRefine(({ re_password, password }, ctx) => {
      if (password && re_password && re_password !== password) {
        ctx.addIssue({
          code: 'custom',
          message: 'messages.passwordMatch',
          path: ['re_password'],
        });
        ctx.addIssue({
          code: 'custom',
          message: 'messages.passwordMatch',
          path: ['password'],
        });
      }
    });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
