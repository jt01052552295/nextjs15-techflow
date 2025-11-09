import { z } from 'zod';

/** 공통: 파일 스키마 (1개 이상 필요) */
export const ShopFileDetailsSchema = z.object({
  idx: z.number().optional(),
  uid: z.string().optional(),
  pid: z.string().optional(),
  name: z.string().optional(), // 서버 저장 파일명(선택)
  originalName: z.string().min(1), // 원본 파일명
  url: z.string().min(1), // 서버 경로(필수)
  previewUrl: z.string().optional(), // 미리보기 URL(선택)
  size: z.coerce.number().min(1), // bytes
  ext: z.string().min(1), // 예: jpg, png
  type: z.string().min(1), // 예: image/jpeg
});

/** 옵션(ShopItemOption) 입력 스키마 (선택) */
export const ShopOptionDetailsSchema = (messages: Record<string, any>) =>
  z
    .object({
      idx: z.number().optional(),
      uid: z.string().optional(),

      gubun: z.string().optional().default(''), // 구분
      parentId: z.coerce.number().min(0).default(0),
      choiceType: z.string().optional().default(''), // SINGLE/MULTI 등 자유 문자열
      name: z.string().trim().min(1, { message: messages.required }), // 옵션명
      price: z.coerce.number().min(0, { message: messages.numeric }).default(0),
      stock: z.coerce.number().min(0, { message: messages.numeric }).default(0),
      buyMin: z.coerce
        .number()
        .min(0, { message: messages.numeric })
        .default(0),
      buyMax: z.coerce
        .number()
        .min(0, { message: messages.numeric })
        .default(0),
      isUse: z.boolean().optional().default(true),
      isVisible: z.boolean().optional().default(true),
      isSoldout: z.boolean().optional().default(false),

      _delete: z.boolean().optional(), // 행 삭제 플래그 (UI용)
    })
    .superRefine((v, ctx) => {
      if (v.buyMax > 0 && v.buyMin > v.buyMax) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['buyMin'],
          message:
            messages.min_lte_max || '최소수량은 최대수량보다 클 수 없습니다.',
        });
      }
    });

/** 추가구성(ShopItemSupply) 입력 스키마 (선택) */
export const ShopSupplyDetailsSchema = (messages: Record<string, any>) =>
  z.object({
    idx: z.number().optional(),
    uid: z.string().optional(),

    gubun: z.string().optional().default(''), // 구분
    parentId: z.coerce.number().min(0).default(0),
    choiceType: z.string().optional().default(''),
    name: z.string().trim().min(1, { message: messages.required }), // 구성명
    price: z.coerce.number().min(0, { message: messages.numeric }).default(0),
    stock: z.coerce.number().min(0, { message: messages.numeric }).default(0),
    isUse: z.boolean().optional().default(true),
    isVisible: z.boolean().optional().default(true),
    isSoldout: z.boolean().optional().default(false),

    _delete: z.boolean().optional(),
  });

/** 기본정보(ShopItem) 입력 스키마 */
export const ShopItemBaseSchema = (messages: Record<string, any>) =>
  z
    .object({
      uid: z.string(),
      cid: z.string(),
      shopId: z.coerce.number().min(0).default(0),

      code: z.string().trim().min(1, { message: messages.required }),
      categoryCode: z.string().trim().min(1, { message: messages.required }),
      name: z.string().trim().min(1, { message: messages.required }), // 필수

      desc1: z.string().optional().default(''),

      basicPrice: z.coerce
        .number()
        .min(0, { message: messages.numeric })
        .default(0),
      basicPriceDc: z.coerce
        .number()
        .min(0, { message: messages.numeric })
        .default(0),
      salePrice: z.coerce
        .number()
        .min(0, { message: messages.numeric })
        .default(0),

      basicDesc: z.string().nullable().optional(),
      etcDesc: z.string().nullable().optional(),

      useDuration: z.coerce
        .number()
        .min(0, { message: messages.numeric })
        .default(0),

      stock: z.coerce.number().min(0, { message: messages.numeric }).default(0),

      isUse: z.boolean().optional().default(true),
      isVisible: z.boolean().optional().default(true),
      isSoldout: z.boolean().optional().default(false),

      orderMinimumCnt: z.coerce
        .number()
        .min(0, { message: messages.numeric })
        .default(0),
      orderMaximumCnt: z.coerce
        .number()
        .min(0, { message: messages.numeric })
        .default(0),
    })
    .superRefine((v, ctx) => {
      if (v.orderMaximumCnt > 0 && v.orderMinimumCnt > v.orderMaximumCnt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['orderMinimumCnt'],
          message:
            messages.min_lte_max ||
            '최소 주문수량은 최대 주문수량보다 클 수 없습니다.',
        });
      }
    });

/** 최상위: 상품 등록 폼 스키마 */
export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    item: ShopItemBaseSchema(messages),

    files: z.array(ShopFileDetailsSchema).optional().default([]),

    // 옵션/추가구성은 선택
    options: z.array(ShopOptionDetailsSchema(messages)).optional().default([]),
    supplies: z.array(ShopSupplyDetailsSchema(messages)).optional().default([]),

    deleteOptionUids: z.array(z.string()).optional(),
    deleteSupplyUids: z.array(z.string()).optional(),
    deleteFileUrls: z.array(z.string()).optional(),
  });

// 3) 섹션 단독 검증용 스키마 (서버/클라 공통으로 재사용)
export const ItemOnlySchema = (msg: any) =>
  z.object({
    item: ShopItemBaseSchema(msg),
  });

export const FilesOnlySchema = z.object({
  files: z
    .array(ShopFileDetailsSchema)
    .min(1, { message: '최소 1개의 이미지를 등록하세요.' }),
});

export const OptionsOnlySchema = (msg: any) =>
  z.object({
    options: z.array(ShopOptionDetailsSchema(msg)).optional().default([]),
  });

export const SuppliesOnlySchema = (msg: any) =>
  z.object({
    supplies: z.array(ShopSupplyDetailsSchema(msg)).optional().default([]),
  });

// 4) 부분 업데이트(PATCH)용: 전체 스키마를 부분 허용으로
export const PatchSchema = (msg: any) => UpdateSchema(msg).partial();
export type PatchType = z.infer<ReturnType<typeof PatchSchema>>;

// ==== 타입들 ====
export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
export type ShopItemBaseType = z.infer<ReturnType<typeof ShopItemBaseSchema>>;
export type ShopFileDetailsType = z.infer<typeof ShopFileDetailsSchema>;
export type ShopOptionDetailsType = z.infer<
  ReturnType<typeof ShopOptionDetailsSchema>
>;
export type ShopSupplyDetailsType = z.infer<
  ReturnType<typeof ShopSupplyDetailsSchema>
>;

// 섹션별 타입 (선택)
export type ItemOnlyType = z.infer<ReturnType<typeof ItemOnlySchema>>;
export type FilesOnlyType = z.infer<typeof FilesOnlySchema>;
export type OptionsOnlyType = z.infer<ReturnType<typeof OptionsOnlySchema>>;
export type SuppliesOnlyType = z.infer<ReturnType<typeof SuppliesOnlySchema>>;
