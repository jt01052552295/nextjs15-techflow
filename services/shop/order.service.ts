import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  DeleteInput,
  DeleteResult,
  OrderStatusInput,
  OrderStatusResult,
  CancelStatusInput,
  CancelStatusResult,
  IShopOrder,
} from '@/types/shop/order';
import type { CreateType } from '@/actions/shop/order/create/schema';
import type { UpdateType } from '@/actions/shop/order/update/schema';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
    name,
    email,
    hp,
    ordNo,
    dateType,
    startDate,
    endDate,
    isUse,
    isVisible,

    sortBy = 'idx',
    order = 'desc',

    limit = 20,
    cursor,
  } = params;

  const safeLimit = Math.min(Math.max(+limit || 20, 1), 100);

  // ───────────────────────────────────
  // where (검색/필터)
  // ───────────────────────────────────
  const baseWhere: Prisma.ShopOrderWhereInput = {
    isUse: typeof isUse === 'boolean' ? isUse : true,
    isVisible: typeof isVisible === 'boolean' ? isVisible : true,
  };

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.ShopOrderWhereInput = q
    ? {
        ...baseWhere,
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { hp: { contains: q } },
          { ordNo: { contains: q } },
        ],
      }
    : {
        ...baseWhere,
        ...(name?.trim() ? { name: { contains: name.trim() } } : {}),
        ...(email?.trim() ? { email: { contains: email.trim() } } : {}),
        ...(hp?.trim() ? { hp: { contains: hp.trim() } } : {}),
        ...(ordNo?.trim() ? { ordNo: { contains: ordNo.trim() } } : {}),
      };

  if (dateType && (startDate || endDate)) {
    const gte = startDate ? new Date(startDate) : undefined;
    const lte = endDate ? new Date(endDate) : undefined;
    if (gte || lte) {
      (filteredWhere as any)[dateType] = {
        ...(gte && { gte }),
        ...(lte && { lte }),
      };
    }
  }

  // ───────────────────────────────────
  // keyset(where) for cursor
  // (A, idx) 기준으로 "다음"을 정의:
  //   (A > a0) OR (A = a0 AND idx > i0)   // asc
  //   (A < a0) OR (A = a0 AND idx < i0)   // desc
  // ───────────────────────────────────
  let keysetWhere: Prisma.ShopOrderWhereInput | undefined;
  if (cursor) {
    const c = b64d(cursor) as { sortValue: any; idx: number };
    const cmpOp = order === 'asc' ? 'gt' : 'lt';

    keysetWhere = {
      OR: [
        { [sortBy]: { [cmpOp]: c.sortValue } as any },
        {
          AND: [
            { [sortBy]: { equals: c.sortValue } as any },
            { idx: { [cmpOp]: c.idx } },
          ],
        },
      ],
    };
  }

  // ───────────────────────────────────
  // orderBy
  // ───────────────────────────────────
  const orderBy: Prisma.ShopOrderOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.ShopOrderWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.shopOrder.findMany({
    where: whereForPage,
    orderBy,
    take: safeLimit + 1,
    include: {
      _count: {
        select: {
          ShopReview: true,
          ShopOrderItem: true,
        },
      },
      ShopOrderItem: {
        include: {
          ShopItem: true,
          ShopOrderOption: true,
          ShopOrderSupply: true,
        },
      },
      ShopOrderPayment: true,
      User: {
        include: {
          profile: true,
        },
      },
    },
  });

  const hasMore = rows.length > safeLimit;
  const items = hasMore ? rows.slice(0, safeLimit) : rows;

  let nextCursor: string | undefined;
  if (hasMore) {
    const last = items[items.length - 1] as any;
    nextCursor = b64e({ sortValue: last[sortBy], idx: last.idx });
  }

  const [totalAll, totalFiltered] = await Promise.all([
    prisma.shopOrder.count({ where: baseWhere }),
    prisma.shopOrder.count({ where: filteredWhere }),
  ]);

  return {
    items: items as unknown as IShopOrder[],
    nextCursor,
    totalAll,
    totalFiltered,
  };
}

/** 보기 */
export async function show(uid: string): Promise<IShopOrder> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.shopOrder.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.shopOrder.findUnique({
    where: { uid },
    include: {
      ShopOrderItem: {
        include: {
          ShopItem: true,
          ShopOrderOption: true,
          ShopOrderSupply: true,
        },
      },
      ShopOrderPayment: true,
      User: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!rs) throw new Error('NOT_FOUND');
  return rs as IShopOrder;
}

/** 작성 */
export async function create(input: CreateType) {
  // CreateType이 어떤 구조인지에 따라 달라지지만,
  // seed 예제를 참고하여 주문(ShopOrder) + 주문상품(ShopOrderItem) + 옵션/추가상품 생성

  const result = await prisma.$transaction(async (tx) => {
    // 1. ShopOrder 생성 (주문 기본 정보)
    const created = await tx.shopOrder.create({
      data: {
        ordNo: input.ordNo,
        shopId: input.shopId ?? 1,
        sellerId: input.sellerId ?? 1,

        // 회원 정보
        userId: input.userId,
        userIdx: input.userIdx,

        gubun: input.gubun ?? 'normal',

        basicPrice: input.basicPrice ?? 0,
        optionPrice: input.optionPrice ?? 0,
        deliveryPrice: input.deliveryPrice ?? 0,
        boxDc: input.boxDc ?? 0,
        payPrice: input.payPrice ?? 0,
        stock: input.stock ?? 1,

        memo: input.memo ?? '',

        orderPaid: input.orderPaid ?? 'unpaid',
        orderStatus: input.orderStatus ?? 'order_pending',
        cancelStatus: input.cancelStatus ?? '',

        paymethod: input.paymethod ?? '',

        // 주문자 정보
        name: input.name ?? '',
        email: input.email ?? '',
        hp: input.hp ?? '',
        zipcode: input.zipcode ?? '',
        jibunAddr1: input.jibunAddr1 ?? '',
        jibunAddr2: input.jibunAddr2 ?? '',
        roadAddr1: input.roadAddr1 ?? '',
        roadAddr2: input.roadAddr2 ?? '',

        // 수령자 정보
        rcvStore: input.rcvStore ?? '',
        rcvName: input.rcvName ?? '',
        rcvHp: input.rcvHp ?? '',
        rcvEmail: input.rcvEmail ?? '',
        rcvDate: input.rcvDate ?? null,
        rcvAddr1: input.rcvAddr1 ?? '',
        rcvAddr2: input.rcvAddr2 ?? '',
        rcvZipcode: input.rcvZipcode ?? '',

        // 결제 관련
        bankAccount: input.bankAccount ?? 0,
        bankDepositName: input.bankDepositName ?? '',
        payEmail: input.payEmail ?? '',
        payRepresent: input.payRepresent ?? 0,
        payDay: input.payDay ?? '',
        payYear: input.payYear ?? false,
        payPeople: input.payPeople ?? 0,

        ipAddress: input.ipAddress ?? '',
        merchantData: input.merchantData ?? null,
      },
    });

    // 2. ShopOrderItem 생성 (주문상품)
    if (input.orderItems && input.orderItems.length > 0) {
      for (const orderItem of input.orderItems) {
        const createdItem = await tx.shopOrderItem.create({
          data: {
            orderId: created.idx,
            itemId: orderItem.itemId,
            itemName: orderItem.itemName,
            quantity: orderItem.quantity,
            salePrice: orderItem.salePrice,
            optionPrice: orderItem.optionPrice ?? 0,
            supplyPrice: orderItem.supplyPrice ?? 0,
            totalPrice: orderItem.totalPrice,
            cartNo: orderItem.cartNo ?? null,
            statusCode: orderItem.statusCode ?? 'order_complete',
          },
        });

        // 2-1. ShopOrderOption 생성 (주문 옵션)
        if (orderItem.options && orderItem.options.length > 0) {
          await tx.shopOrderOption.createMany({
            data: orderItem.options.map((opt) => ({
              orderId: created.idx,
              orderItemId: createdItem.idx,
              optionId: opt.optionId,
              name: opt.name,
              price: opt.price,
              quantity: opt.quantity,
            })),
          });
        }

        // 2-2. ShopOrderSupply 생성 (주문 추가상품)
        if (orderItem.supplies && orderItem.supplies.length > 0) {
          await tx.shopOrderSupply.createMany({
            data: orderItem.supplies.map((sup) => ({
              orderId: created.idx,
              orderItemId: createdItem.idx,
              supplyId: sup.supplyId,
              name: sup.name,
              price: sup.price,
              quantity: sup.quantity,
            })),
          });
        }
      }
    }

    // 3. ShopOrderPayment 생성 (결제 정보)
    if (input.payment) {
      await tx.shopOrderPayment.create({
        data: {
          orderId: created.idx,
          gubun: input.payment.gubun ?? 'shop',
          applyNum: input.payment.applyNum ?? '',
          amount: input.payment.amount ?? 0,
          cancelAmount: input.payment.cancelAmount ?? 0,
          buyerAddr: input.payment.buyerAddr ?? '',
          buyerEmail: input.payment.buyerEmail ?? '',
          buyerName: input.payment.buyerName ?? '',
          buyerPostcode: input.payment.buyerPostcode ?? '',
          buyerTel: input.payment.buyerTel ?? '',
          cardName: input.payment.cardName ?? '',
          cardNumber: input.payment.cardNumber ?? '',
          cardQuota: input.payment.cardQuota ?? 0,
          customData: input.payment.customData ?? null,
          impUid: input.payment.impUid ?? '',
          merchantUid: input.payment.merchantUid ?? '',
          name: input.payment.name ?? '',
          paidAmount: input.payment.paidAmount ?? 0,
          paidAt: input.payment.paidAt ?? 0,
          cancelledAt: input.payment.cancelledAt ?? 0,
          payMethod: input.payment.payMethod ?? '',
          pgProvider: input.payment.pgProvider ?? '',
          pgTid: input.payment.pgTid ?? '',
          pgType: input.payment.pgType ?? '',
          receiptUrl: input.payment.receiptUrl ?? '',
          status: input.payment.status ?? 'pending',
          orderData: input.payment.orderData ?? null,
          device: input.payment.device ?? '',
          shopId: input.payment.shopId ?? 1,
          sellerId: input.payment.sellerId ?? 1,
        },
      });
    }

    // 4. 최종 결과 조회
    const withRelations = await tx.shopOrder.findUnique({
      where: { uid: created.uid },
      include: {
        ShopOrderItem: {
          include: {
            ShopItem: true,
            ShopOrderOption: true,
            ShopOrderSupply: true,
          },
        },
        ShopOrderPayment: true,
        User: {
          include: {
            profile: true,
          },
        },
      },
    });

    return withRelations!;
  });

  return result;
}

/** 수정 */
export async function update(input: UpdateType) {
  const exist = await prisma.shopOrder.findUnique({
    where: { uid: input.uid },
    select: { idx: true, uid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (tx) => {
    // 1. ShopOrder 기본 정보 업데이트
    await tx.shopOrder.update({
      where: { uid: input.uid },
      data: {
        shopId: input.shopId ?? undefined,
        sellerId: input.sellerId ?? undefined,
        gubun: input.gubun ?? undefined,
        basicPrice: input.basicPrice ?? undefined,
        optionPrice: input.optionPrice ?? undefined,
        deliveryPrice: input.deliveryPrice ?? undefined,
        boxDc: input.boxDc ?? undefined,
        payPrice: input.payPrice ?? undefined,
        stock: input.stock ?? undefined,
        memo: input.memo ?? undefined,
        orderPaid: input.orderPaid ?? undefined,
        orderStatus: input.orderStatus ?? undefined,
        cancelStatus: input.cancelStatus ?? undefined,
        paymethod: input.paymethod ?? undefined,
        name: input.name ?? undefined,
        email: input.email ?? undefined,
        hp: input.hp ?? undefined,
        zipcode: input.zipcode ?? undefined,
        jibunAddr1: input.jibunAddr1 ?? undefined,
        jibunAddr2: input.jibunAddr2 ?? undefined,
        roadAddr1: input.roadAddr1 ?? undefined,
        roadAddr2: input.roadAddr2 ?? undefined,
        rcvStore: input.rcvStore ?? undefined,
        rcvName: input.rcvName ?? undefined,
        rcvHp: input.rcvHp ?? undefined,
        rcvEmail: input.rcvEmail ?? undefined,
        rcvDate: input.rcvDate ?? undefined,
        rcvAddr1: input.rcvAddr1 ?? undefined,
        rcvAddr2: input.rcvAddr2 ?? undefined,
        rcvZipcode: input.rcvZipcode ?? undefined,
      },
    });

    // 2. ShopOrderItem 삭제할 것들 처리
    if (input.deleteOrderItemUids && input.deleteOrderItemUids.length > 0) {
      const itemsToDelete = await tx.shopOrderItem.findMany({
        where: { uid: { in: input.deleteOrderItemUids } },
        select: { idx: true },
      });
      const itemIds = itemsToDelete.map((item) => item.idx);

      if (itemIds.length > 0) {
        await tx.shopOrderOption.deleteMany({
          where: { orderItemId: { in: itemIds } },
        });
        await tx.shopOrderSupply.deleteMany({
          where: { orderItemId: { in: itemIds } },
        });
        await tx.shopOrderItem.deleteMany({
          where: { uid: { in: input.deleteOrderItemUids } },
        });
      }
    }

    // 3. ShopOrderItem 업데이트 및 생성
    if (input.orderItems && input.orderItems.length > 0) {
      for (const orderItem of input.orderItems) {
        if (orderItem.uid) {
          // 기존 주문상품 업데이트
          const existingItem = await tx.shopOrderItem.findUnique({
            where: { uid: orderItem.uid },
          });

          if (existingItem) {
            await tx.shopOrderItem.update({
              where: { uid: orderItem.uid },
              data: {
                itemId: orderItem.itemId ?? undefined,
                itemName: orderItem.itemName ?? undefined,
                quantity: orderItem.quantity ?? undefined,
                salePrice: orderItem.salePrice ?? undefined,
                optionPrice: orderItem.optionPrice ?? undefined,
                supplyPrice: orderItem.supplyPrice ?? undefined,
                totalPrice: orderItem.totalPrice ?? undefined,
                statusCode: orderItem.statusCode ?? undefined,
              },
            });

            // 옵션 업데이트 (기존 삭제 후 재생성)
            await tx.shopOrderOption.deleteMany({
              where: { orderItemId: existingItem.idx },
            });
            if (orderItem.options && orderItem.options.length > 0) {
              await tx.shopOrderOption.createMany({
                data: orderItem.options.map((opt) => ({
                  orderId: exist.idx,
                  orderItemId: existingItem.idx,
                  optionId: opt.optionId,
                  name: opt.name,
                  price: opt.price,
                  quantity: opt.quantity,
                })),
              });
            }

            // 추가상품 업데이트 (기존 삭제 후 재생성)
            await tx.shopOrderSupply.deleteMany({
              where: { orderItemId: existingItem.idx },
            });
            if (orderItem.supplies && orderItem.supplies.length > 0) {
              await tx.shopOrderSupply.createMany({
                data: orderItem.supplies.map((sup) => ({
                  orderId: exist.idx,
                  orderItemId: existingItem.idx,
                  supplyId: sup.supplyId,
                  name: sup.name,
                  price: sup.price,
                  quantity: sup.quantity,
                })),
              });
            }
          }
        } else {
          // 새 주문상품 생성
          const createdItem = await tx.shopOrderItem.create({
            data: {
              orderId: exist.idx,
              itemId: orderItem.itemId,
              itemName: orderItem.itemName,
              quantity: orderItem.quantity,
              salePrice: orderItem.salePrice,
              optionPrice: orderItem.optionPrice ?? 0,
              supplyPrice: orderItem.supplyPrice ?? 0,
              totalPrice: orderItem.totalPrice,
              cartNo: orderItem.cartNo ?? null,
              statusCode: orderItem.statusCode ?? 'order_complete',
            },
          });

          if (orderItem.options && orderItem.options.length > 0) {
            await tx.shopOrderOption.createMany({
              data: orderItem.options.map((opt) => ({
                orderId: exist.idx,
                orderItemId: createdItem.idx,
                optionId: opt.optionId,
                name: opt.name,
                price: opt.price,
                quantity: opt.quantity,
              })),
            });
          }

          if (orderItem.supplies && orderItem.supplies.length > 0) {
            await tx.shopOrderSupply.createMany({
              data: orderItem.supplies.map((sup) => ({
                orderId: exist.idx,
                orderItemId: createdItem.idx,
                supplyId: sup.supplyId,
                name: sup.name,
                price: sup.price,
                quantity: sup.quantity,
              })),
            });
          }
        }
      }
    }

    // 4. ShopOrderPayment 업데이트
    if (input.payment) {
      const existingPayment = await tx.shopOrderPayment.findFirst({
        where: { orderId: exist.idx },
      });

      if (existingPayment) {
        await tx.shopOrderPayment.update({
          where: { idx: existingPayment.idx },
          data: {
            applyNum: input.payment.applyNum ?? undefined,
            amount: input.payment.amount ?? undefined,
            cancelAmount: input.payment.cancelAmount ?? undefined,
            status: input.payment.status ?? undefined,
            paidAmount: input.payment.paidAmount ?? undefined,
            paidAt: input.payment.paidAt ?? undefined,
            cancelledAt: input.payment.cancelledAt ?? undefined,
          },
        });
      } else if (input.payment.create) {
        await tx.shopOrderPayment.create({
          data: {
            orderId: exist.idx,
            gubun: input.payment.gubun ?? 'shop',
            applyNum: input.payment.applyNum ?? '',
            amount: input.payment.amount ?? 0,
            cancelAmount: input.payment.cancelAmount ?? 0,
            buyerAddr: input.payment.buyerAddr ?? '',
            buyerEmail: input.payment.buyerEmail ?? '',
            buyerName: input.payment.buyerName ?? '',
            buyerPostcode: input.payment.buyerPostcode ?? '',
            buyerTel: input.payment.buyerTel ?? '',
            cardName: input.payment.cardName ?? '',
            cardNumber: input.payment.cardNumber ?? '',
            cardQuota: input.payment.cardQuota ?? 0,
            impUid: input.payment.impUid ?? '',
            merchantUid: input.payment.merchantUid ?? '',
            name: input.payment.name ?? '',
            paidAmount: input.payment.paidAmount ?? 0,
            paidAt: input.payment.paidAt ?? 0,
            status: input.payment.status ?? 'pending',
            payMethod: input.payment.payMethod ?? '',
            pgProvider: input.payment.pgProvider ?? '',
            shopId: input.payment.shopId ?? 1,
            sellerId: input.payment.sellerId ?? 1,
          },
        });
      }
    }

    // 5. 최종 결과 반환
    const updated = await tx.shopOrder.findUnique({
      where: { uid: input.uid },
      include: {
        ShopOrderItem: {
          include: {
            ShopItem: true,
            ShopOrderOption: true,
            ShopOrderSupply: true,
          },
        },
        ShopOrderPayment: true,
        User: {
          include: {
            profile: true,
          },
        },
      },
    });

    return updated!;
  });

  return rs;
}

/** 삭제 */
export async function remove(input: DeleteInput): Promise<DeleteResult> {
  const { uid, uids, hard = false } = input;

  // 유효성
  if (!uid && (!uids || uids.length === 0)) {
    throw new Error('MISSING_ID');
  }

  // Bulk
  if (uids && uids.length > 0) {
    return await prisma.$transaction(async (tx) => {
      // 먼저 idx 조회
      const orders = await tx.shopOrder.findMany({
        where: { uid: { in: uids } },
        select: { idx: true, uid: true },
      });
      const orderIds = orders.map((o) => o.idx);

      // 1. ShopOrderItem 먼저 조회
      const orderItems = await tx.shopOrderItem.findMany({
        where: { orderId: { in: orderIds } },
        select: { idx: true },
      });
      const orderItemIds = orderItems.map((item) => item.idx);

      // 2. ShopOrderOption, ShopOrderSupply 삭제 (orderItemId 사용)
      if (orderItemIds.length > 0) {
        await tx.shopOrderOption.deleteMany({
          where: { orderItemId: { in: orderItemIds } },
        });
        await tx.shopOrderSupply.deleteMany({
          where: { orderItemId: { in: orderItemIds } },
        });
      }

      // 3. ShopOrderItem 삭제
      await tx.shopOrderItem.deleteMany({
        where: { orderId: { in: orderIds } },
      });

      // 4. ShopOrderPayment 삭제 (orderId 사용)
      await tx.shopOrderPayment.deleteMany({
        where: { orderId: { in: orderIds } },
      });

      // 5. ShopOrder 삭제 또는 비활성화
      if (hard) {
        const rs = await tx.shopOrder.deleteMany({
          where: { uid: { in: uids } },
        });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.shopOrder.updateMany({
          where: { uid: { in: uids } },
          data: { isUse: false, isVisible: false },
        });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const row = await prisma.shopOrder.findUnique({
    where: { uid: uid! },
    select: { idx: true, uid: true },
  });
  if (!row) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    // 1. ShopOrderItem 먼저 조회
    const orderItems = await tx.shopOrderItem.findMany({
      where: { orderId: row.idx },
      select: { idx: true },
    });
    const orderItemIds = orderItems.map((item) => item.idx);

    // 2. ShopOrderOption, ShopOrderSupply 삭제
    if (orderItemIds.length > 0) {
      await tx.shopOrderOption.deleteMany({
        where: { orderItemId: { in: orderItemIds } },
      });
      await tx.shopOrderSupply.deleteMany({
        where: { orderItemId: { in: orderItemIds } },
      });
    }

    // 3. ShopOrderItem 삭제
    await tx.shopOrderItem.deleteMany({
      where: { orderId: row.idx },
    });

    // 4. ShopOrderPayment 삭제
    await tx.shopOrderPayment.deleteMany({
      where: { orderId: row.idx },
    });

    // 5. ShopOrder 삭제 또는 비활성화
    if (hard) {
      const rs = await tx.shopOrder.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.shopOrder.update({
        where: { uid: uid! },
        data: { isUse: false, isVisible: false },
      });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}

/**
 * 주문 상태(orderStatus) 변경 서비스
 * - 단일/복수 모두 처리 가능
 * - updateOrderStatusAction 이 이 함수를 호출함
 */
export async function updateOrder(
  input: OrderStatusInput,
): Promise<OrderStatusResult> {
  const { uid, uids, orderStatus } = input;

  // 여기서도 한 번 더 방어적으로 체크 (액션에서도 한 번 체크하지만 중복 방어용)
  if (!uid && (!uids || uids.length === 0)) {
    throw new Error('MISSING_ID');
  }

  // ✅ 1) 복수 처리 (목록에서 체크 후 일괄 변경)
  if (uids && uids.length > 0) {
    const rs = await prisma.shopOrder.updateMany({
      where: {
        uid: { in: uids },
      },
      data: {
        orderStatus,
      },
    });

    return {
      mode: 'bulk',
      affected: rs.count,
    };
  }

  // ✅ 2) 단일 처리 (상세 페이지에서 개별 변경)
  const row = await prisma.shopOrder.findUnique({
    where: { uid: uid! },
    select: { idx: true, uid: true },
  });

  if (!row) {
    throw new Error('NOT_FOUND');
  }

  const rs = await prisma.shopOrder.update({
    where: { uid: uid! },
    data: {
      orderStatus,
    },
  });

  return {
    mode: 'single',
    affected: rs ? 1 : 0,
  };
}

/**
 * 주문 취소 상태(cancelStatus) 및 취소 사유 변경 서비스
 * - 단일/복수 모두 처리 가능
 * - updateCancelStatusAction 에서 이 함수를 호출한다.
 */
export async function updateCancel(
  input: CancelStatusInput,
): Promise<CancelStatusResult> {
  const { uid, uids, cancelStatus, cancelReasonCode, cancelReasonText } = input;

  // 공통 데이터 구성
  const data: any = {
    cancelStatus,
    cancelReasonCode,
    cancelReasonText: cancelReasonText ?? null,
  };

  // "none"이면 사유 초기화
  if (cancelStatus === 'none') {
    data.cancelReasonCode = '';
    data.cancelReasonText = null;
    data.cancelRejectedReasonText = null;
    data.cancelRequestedAt = null;
    data.cancelRequestedBy = '';
  }

  // "requested" 상태면 요청시각 자동 세팅
  if (cancelStatus === 'requested') {
    data.cancelRequestedAt = new Date();
    // data.cancelRequestedBy 도 여기서 세팅할 수 있음 (필요하면)
  }

  /** 1) 단일 처리: uid 우선 */
  if (uid) {
    const row = await prisma.shopOrder.findUnique({
      where: { uid },
      select: { idx: true, uid: true },
    });

    if (!row) {
      throw new Error('NOT_FOUND');
    }

    const rs = await prisma.shopOrder.update({
      where: { uid },
      data,
    });

    return {
      mode: 'single',
      affected: rs ? 1 : 0,
      order: rs, // 필요 없다면 이 필드 빼도 됨
    };
  }

  /** 2) 복수 처리: uids */
  if (uids && uids.length > 0) {
    const rs = await prisma.shopOrder.updateMany({
      where: {
        uid: { in: uids },
      },
      data,
    });

    return {
      mode: 'bulk',
      affected: rs.count,
    };
  }

  /** 3) 둘 다 없으면 에러 */
  throw new Error('MISSING_ID');
}
