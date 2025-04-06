import { z } from 'zod';
import { formatMessage } from '@/lib/util';

export const accountSchema = (messages: Record<string, any>) =>
  z.object({
    hp: z.string().regex(/[0-9]/, { message: messages.number }),
    hpCode: z
      .string()
      .regex(/[0-9]/, { message: messages.number })
      .min(6, {
        message: formatMessage(messages.txt.charCount, { charCount: '6' }),
      }),
  });

export type AccountType = z.infer<ReturnType<typeof accountSchema>>;
