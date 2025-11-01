import { z } from 'zod';

const urlOrEmpty255 = z.union([
  z.string().trim().url().max(255),
  z.literal(''),
]);

export const CreateSchema = (messages: Record<string, any>) =>
  z
    .object({
      // 기본키/식별자
      uid: z.string().min(3, { message: messages.required }),

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

      // 메타/표시 여부
      isUse: z.boolean().default(true),
      isVisible: z.boolean().default(true),
    })
    .superRefine((v, ctx) => {
      // ANDROID: 강제(2)면 버전 + 스토어 링크(앱/웹 중 하나) 필수
      const isAosForce = v.aosUpdate === '2';
      if (isAosForce && !v.aosVersion) {
        ctx.addIssue({
          path: ['aosVersion'],
          code: z.ZodIssueCode.custom,
          message: messages.required,
        });
      }
      if (isAosForce && !v.aosStoreApp && !v.aosStoreWeb) {
        ctx.addIssue({
          path: ['aosStoreApp'],
          code: z.ZodIssueCode.custom,
          message: '앱 또는 웹 스토어 주소 중 하나는 필수입니다.',
        });
      }

      // iOS: 강제(2)면 버전 + 스토어 링크(앱/웹 중 하나) 필수
      const isIosForce = v.iosUpdate === '2';
      if (isIosForce && !v.iosVersion) {
        ctx.addIssue({
          path: ['iosVersion'],
          code: z.ZodIssueCode.custom,
          message: messages.required,
        });
      }
      if (isIosForce && !v.iosStoreApp && !v.iosStoreWeb) {
        ctx.addIssue({
          path: ['iosStoreApp'],
          code: z.ZodIssueCode.custom,
          message: '앱 또는 웹 스토어 주소 중 하나는 필수입니다.',
        });
      }
    });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
