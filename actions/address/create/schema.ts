import { z } from 'zod';

export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),
    userId: z.string().uuid({
      message: messages.required,
    }),
    title: z.string().min(1, {
      message: messages.required,
    }), // 배송지명
    name: z.string().min(1, {
      message: messages.required,
    }), // 수령인명
    zipcode: z.string().min(1, {
      message: messages.required,
    }), // 우편번호
    addr1: z.string().min(1, {
      message: messages.required,
    }), // 주소
    addr2: z.string().default(''), // 상세주소
    addrJibeon: z.string().default(''), // 지번주소
    sido: z.string().default(''), // 시도
    gugun: z.string().default(''), // 구군
    dong: z.string().default(''), // 동
    latNum: z.string().nullable().optional(), // 위도
    lngNum: z.string().nullable().optional(), // 경도
    hp: z.string().min(1, {
      message: messages.required,
    }), // 휴대폰번호
    tel: z.string().default(''), // 전화번호
    isDefault: z.boolean().default(false), // 기본배송지 여부
    rmemo: z
      .enum(['CALL_BEFORE', 'KNOCK', 'MEET_OUTSIDE', 'CUSTOM'])
      .default('CALL_BEFORE'), // 배송 메모 타입
    rmemoTxt: z.string().nullable().optional(), // 배송 메모 직접입력
    doorPwd: z.string().nullable().optional(), // 현관 출입번호
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
