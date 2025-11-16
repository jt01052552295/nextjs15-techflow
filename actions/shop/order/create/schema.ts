import { z } from 'zod';

/** 주문 옵션 스키마 */
export const ShopOrderOptionSchema = z.object({
  optionId: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

/** 주문 추가상품 스키마 */
export const ShopOrderSupplySchema = z.object({
  supplyId: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

/** 주문 상품 스키마 */
export const ShopOrderItemSchema = z.object({
  itemId: z.number(),
  itemName: z.string().min(1, '상품명을 입력하세요.'),
  quantity: z.number().min(1, '수량은 1 이상이어야 합니다.'),
  salePrice: z.number().min(0),
  optionPrice: z.number().default(0),
  supplyPrice: z.number().default(0),
  totalPrice: z.number().min(0),
  cartNo: z.string().optional().nullable(),
  statusCode: z.string().default('order_complete'),
  options: z.array(ShopOrderOptionSchema).optional().default([]),
  supplies: z.array(ShopOrderSupplySchema).optional().default([]),
});

/** 결제 정보 스키마 */
export const ShopOrderPaymentSchema = z.object({
  gubun: z.string().default('shop'),
  applyNum: z.string().default(''),
  amount: z.number().default(0),
  cancelAmount: z.number().default(0),
  buyerAddr: z.string().default(''),
  buyerEmail: z.string().default(''),
  buyerName: z.string().default(''),
  buyerPostcode: z.string().default(''),
  buyerTel: z.string().default(''),
  cardName: z.string().default(''),
  cardNumber: z.string().default(''),
  cardQuota: z.number().default(0),
  customData: z.any().optional().nullable(),
  impUid: z.string().default(''),
  merchantUid: z.string().default(''),
  name: z.string().default(''),
  paidAmount: z.number().default(0),
  paidAt: z.number().default(0),
  cancelledAt: z.number().default(0),
  payMethod: z.string().default(''),
  pgProvider: z.string().default(''),
  pgTid: z.string().default(''),
  pgType: z.string().default(''),
  receiptUrl: z.string().default(''),
  status: z.string().default('pending'),
  orderData: z.any().optional().nullable(),
  device: z.string().default(''),
  shopId: z.number().default(1),
  sellerId: z.number().default(1),
});

/** 주문 생성 스키마 */
export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(1, messages.required || 'UID를 입력하세요.'),
    ordNo: z.string().min(1, messages.required || '주문번호를 입력하세요.'),
    shopId: z.number().default(1),
    sellerId: z.number().default(1),

    // 회원 정보
    userId: z.string().min(1, messages.required),
    userIdx: z.number(),

    gubun: z.string().default('normal'),

    // 가격 정보
    basicPrice: z.number().default(0),
    optionPrice: z.number().default(0),
    deliveryPrice: z.number().default(0),
    boxDc: z.number().default(0),
    payPrice: z.number().default(0),
    stock: z.number().default(1),

    memo: z.string().default(''),

    // 주문 상태
    orderPaid: z.string().default('unpaid'),
    orderStatus: z.string().default('order_pending'),
    cancelStatus: z.string().default(''),
    paymethod: z.string().default(''),

    // 주문자 정보
    name: z.string().default(''),
    email: z.string().default(''),
    hp: z.string().default(''),
    zipcode: z.string().default(''),
    jibunAddr1: z.string().default(''),
    jibunAddr2: z.string().default(''),
    roadAddr1: z.string().default(''),
    roadAddr2: z.string().default(''),

    // 수령자 정보
    rcvStore: z.string().default(''),
    rcvName: z.string().default(''),
    rcvHp: z.string().default(''),
    rcvEmail: z.string().default(''),
    rcvDate: z.string().optional().nullable(),
    rcvAddr1: z.string().default(''),
    rcvAddr2: z.string().default(''),
    rcvZipcode: z.string().default(''),

    // 결제 관련
    bankAccount: z.number().default(0),
    bankDepositName: z.string().default(''),
    payEmail: z.string().default(''),
    payRepresent: z.number().default(0),
    payDay: z.string().default(''),
    payYear: z.boolean().default(false),
    payPeople: z.number().default(0),

    ipAddress: z.string().default(''),
    merchantData: z.any().optional().nullable(),

    // 주문 상품 목록
    orderItems: z
      .array(ShopOrderItemSchema)
      .min(1, '최소 1개의 상품을 선택하세요.'),

    // 결제 정보
    payment: ShopOrderPaymentSchema.optional(),
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
export type ShopOrderItemType = z.infer<typeof ShopOrderItemSchema>;
export type ShopOrderOptionType = z.infer<typeof ShopOrderOptionSchema>;
export type ShopOrderSupplyType = z.infer<typeof ShopOrderSupplySchema>;
export type ShopOrderPaymentType = z.infer<typeof ShopOrderPaymentSchema>;
