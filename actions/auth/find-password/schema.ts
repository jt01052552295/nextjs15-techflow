import { z } from 'zod';
import { formatMessage } from '@/lib/util';

export const passwordSchema = (messages: Record<string, any>) =>
  z
    .object({
      email: z.string().email({ message: messages.email }),
      emailCode: z
        .string()
        .regex(/[0-9]/, { message: messages.number })
        .min(6, {
          message: formatMessage(messages.txt.charCount, { charCount: '6' }),
        }),
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
    })
    .superRefine(({ re_password, password }, ctx) => {
      if (re_password !== password) {
        ctx.addIssue({
          code: 'custom',
          message: messages.passwordMatch,
          path: ['re_password'],
        });
        ctx.addIssue({
          code: 'custom',
          message: messages.passwordMatch,
          path: ['password'],
        });
      }
    });

export type PasswordType = z.infer<ReturnType<typeof passwordSchema>>;
