import { z } from 'zod';
import { formatMessage } from '@/lib/util';

export const registerSchema = (messages: Record<string, any>) =>
  z.object({
    email: z
      .string()
      .min(1, { message: messages.required })
      .email({ message: messages.email }),
    name: z
      .string()
      .min(2, {
        message: formatMessage(messages.txt.charCount, { charCount: '2' }),
      })
      .max(20, {
        message: formatMessage(messages.txt.maxChars, { maxChars: '20' }),
      })
      .regex(/^[a-zA-Z가-힣]+$/, { message: messages.nameCondition }),
    hp: z.string().regex(/[0-9]/, { message: messages.number }),
    hpCode: z
      .string()
      .regex(/[0-9]/, { message: messages.number })
      .min(6, {
        message: formatMessage(messages.txt.charCount, { charCount: '6' }),
      }),
    privacy: z.literal(true, {
      errorMap: () => ({ message: messages.privacy }),
    }),
  });

export type RegisterType = z.infer<ReturnType<typeof registerSchema>>;
