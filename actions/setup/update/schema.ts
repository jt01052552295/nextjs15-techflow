import { z } from 'zod';

const urlOrEmpty255 = z.union([
  z.string().trim().url().max(255),
  z.literal(''),
]);

export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(3, {
      message: messages.required,
    }),

    // 기본 설정 여부
    isDefault: z.boolean().default(false),

    // SNS 링크 (빈문자열 허용, 최대 255)
    snsFacebook: urlOrEmpty255.optional(),
    snsTwitter: urlOrEmpty255.optional(),
    snsInstagram: urlOrEmpty255.optional(),
    snsYoutube: urlOrEmpty255.optional(),
    snsLinkedin: urlOrEmpty255.optional(),
    snsKakao: urlOrEmpty255.optional(),
    snsNaver: urlOrEmpty255.optional(),

    // 텍스트(내용 길이 제약 없음: MediumText)
    idFilter: z.string().optional(),
    wordFilter: z.string().optional(),
    possibleIp: z.string().optional(),
    interceptIp: z.string().optional(),

    // Android
    aosVersion: z.string().max(45).optional(),
    aosUpdate: z.enum(['1', '2']).optional(),
    aosStoreApp: urlOrEmpty255.optional(),
    aosStoreWeb: urlOrEmpty255.optional(),

    // iOS
    iosVersion: z.string().max(45).optional(),
    iosUpdate: z.enum(['1', '2']).optional(),
    iosStoreApp: urlOrEmpty255.optional(),
    iosStoreWeb: urlOrEmpty255.optional(),

    // 정적 리소스 버전 (쿼리스트링용)
    jsCssVer: z.string().max(45).optional(),

    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
