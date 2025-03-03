import { z } from 'zod';
import { formatMessage } from '@/lib/util';

export const loginSchema = (messages: Record<string, any>) =>
  z.object({
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
    rememberEmail: z.boolean().optional().default(false),
  });

export type LoginType = z.infer<ReturnType<typeof loginSchema>>;
