import { z } from 'zod';
import { formatMessage } from '@/lib/util';

export const passwordSchema = (messages: Record<string, any>) =>
  z.object({
    id: z.string({
      message: formatMessage(messages.notExist, { column: 'ID' }),
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
  });

export type PasswordType = z.infer<ReturnType<typeof passwordSchema>>;
