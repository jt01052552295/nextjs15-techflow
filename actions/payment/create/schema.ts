import { z } from 'zod';

export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    userId: z.string().uuid({
      message: messages.required,
    }),
    customerUid: z.string().optional(), // PG사 고객 고유 UID
    billingKey: z.string().optional(), // PG사 빌링키
    method: z.string().default('card'), // 결제 수단 (기본값: card)
    name: z.string().min(1, {
      message: messages.required,
    }),
    cardName: z.string().min(1, {
      message: messages.required,
    }), // 카드사명 (필수)
    cardNumber1: z.string().min(4, {
      message: messages.required,
    }), // 카드번호 1번째 블럭 (필수)
    cardNumber2: z.string().min(4, {
      message: messages.required,
    }), // 카드번호 2번째 블럭 (필수)
    cardNumber3: z.string().min(4, {
      message: messages.required,
    }), // 카드번호 3번째 블럭 (필수)
    cardNumber4: z.string().min(4, {
      message: messages.required,
    }), // 카드번호 4번째 블럭 (필수)
    cardMM: z.string().length(2, {
      message: messages.invalidFormat,
    }), // 유효기간 월 (MM) (필수)
    cardYY: z.string().length(4, {
      message: messages.invalidFormat,
    }), // 유효기간 연도 (YYYY) (필수)
    cardPwd: z.string().min(2, {
      message: messages.required,
    }), // 카드 비밀번호 앞 2자리 (필수)
    cardCvc: z.string().min(3, {
      message: messages.required,
    }), // CVC 코드 (필수)
    juminOrCorp: z.string().min(6, {
      message: messages.required,
    }), // 주민번호 또는 사업자등록번호 앞자리 (필수)
    isRepresent: z.boolean().default(false), // 대표 결제카드 여부
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
