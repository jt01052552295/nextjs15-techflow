import { z } from 'zod';

/** 주문 옵션 스키마 */
export const ShopOrderOptionSchema = z.object({
  uid: z.string().optional(),
  optionId: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

/** 주문 추가상품 스키마 */
export const ShopOrderSupplySchema = z.object({
  uid: z.string().optional(),
  supplyId: z.number(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

/** 주문 상품 스키마 */
export const ShopOrderItemSchema = z.object({
  uid: z.string().optional(), // 업데이트 시 필요
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
  create: z.boolean().optional(), // 새로 생성할지 여부
  gubun: z.string().optional(),
  applyNum: z.string().optional(),
  amount: z.number().optional(),
  cancelAmount: z.number().optional(),
  buyerAddr: z.string().optional(),
  buyerEmail: z.string().optional(),
  buyerName: z.string().optional(),
  buyerPostcode: z.string().optional(),
  buyerTel: z.string().optional(),
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  cardQuota: z.number().optional(),
  impUid: z.string().optional(),
  merchantUid: z.string().optional(),
  name: z.string().optional(),
  paidAmount: z.number().optional(),
  paidAt: z.number().optional(),
  cancelledAt: z.number().optional(),
  status: z.string().optional(),
  payMethod: z.string().optional(),
  pgProvider: z.string().optional(),
  shopId: z.number().optional(),
  sellerId: z.number().optional(),
});

/** 주문 수정 스키마 */
export const UpdateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string().min(1, messages.required),
    ordNo: z.string().min(1, messages.required),

    shopId: z.number().optional(),
    sellerId: z.number().optional(),
    gubun: z.string().optional(),

    // 가격 정보
    basicPrice: z.number().optional(),
    optionPrice: z.number().optional(),
    deliveryPrice: z.number().optional(),
    boxDc: z.number().optional(),
    payPrice: z.number().optional(),
    payDay: z.string().optional(),
    payEmail: z.string().optional(),
    payPeople: z.number().optional(),
    payRepresent: z.number().optional(),
    payYear: z.boolean().optional(),
    stock: z.number().optional(),

    memo: z.string().optional(),

    // 주문 상태
    orderPaid: z.string().optional(),
    orderStatus: z.string().optional(),
    cancelStatus: z.string().optional(),
    cancelRequestedBy: z.string().optional(),
    cancelRequestedAt: z.string().optional(),
    cancelReasonCode: z.string().optional(),
    cancelReasonText: z.string().optional(),
    cancelRejectedReasonText: z.string().optional(),

    paymethod: z.string().optional(),

    // 주문자 정보
    name: z.string().optional(),
    email: z.string().optional(),
    hp: z.string().optional(),
    zipcode: z.string().optional(),
    jibunAddr1: z.string().optional(),
    jibunAddr2: z.string().optional(),
    roadAddr1: z.string().optional(),
    roadAddr2: z.string().optional(),

    // 수령자 정보
    rcvStore: z.string().optional(),
    rcvName: z.string().optional(),
    rcvHp: z.string().optional(),
    rcvEmail: z.string().optional(),
    rcvDate: z.string().optional(),
    rcvAddr1: z.string().optional(),
    rcvAddr2: z.string().optional(),
    rcvZipcode: z.string().optional(),

    // 주문 상품 목록
    orderItems: z.array(ShopOrderItemSchema).optional(),

    // 삭제할 주문 상품 UID 목록
    deleteOrderItemUids: z.array(z.string()).optional(),

    // 결제 정보
    payment: ShopOrderPaymentSchema.optional(),
    createdAt: z.string().optional(),

    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type UpdateType = z.infer<ReturnType<typeof UpdateSchema>>;
export type ShopOrderItemType = z.infer<typeof ShopOrderItemSchema>;
export type ShopOrderOptionType = z.infer<typeof ShopOrderOptionSchema>;
export type ShopOrderSupplyType = z.infer<typeof ShopOrderSupplySchema>;
export type ShopOrderPaymentType = z.infer<typeof ShopOrderPaymentSchema>;
