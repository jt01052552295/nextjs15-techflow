import { z } from 'zod';
import { formatMessage } from '@/lib/util';

export const withdrawSchema = (messages: Record<string, any>) =>
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
    isSignout: z.boolean().optional(),
  });

export type WithdrawType = z.infer<ReturnType<typeof withdrawSchema>>;
