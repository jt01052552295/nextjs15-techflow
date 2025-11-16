import { Prisma, ShopOrder } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '@/lib/prisma';

export async function generateOrderNo(): Promise<string> {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const ymd = `${year}${month}${day}`; // 20251114
  const prefix = `T${ymd}`; // T20251114

  // 오늘 날짜(prefix)로 시작하는 주문번호 중 가장 마지막(ordNo DESC) 하나 조회
  const lastOrder = await prisma.shopOrder.findFirst({
    where: {
      ordNo: {
        startsWith: prefix,
      },
    },
    orderBy: {
      ordNo: 'desc',
    },
    select: {
      ordNo: true,
    },
  });

  let nextSeq = 1;

  if (lastOrder?.ordNo) {
    // 예: T202511140013 -> '0013' 부분만 잘라서 숫자로 변환
    const lastSeqStr = lastOrder.ordNo.slice(prefix.length); // '0013'
    const lastSeq = parseInt(lastSeqStr, 10);

    if (!Number.isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  const seqStr = String(nextSeq).padStart(4, '0'); // 1 -> '0001'

  return `${prefix}${seqStr}`; // T202511140001
}

export async function generateOrderNoSafe(
  data: Omit<Prisma.ShopOrderUncheckedCreateInput, 'ordNo'>,
  maxRetry = 3,
): Promise<ShopOrder> {
  let attempt = 0;

  while (attempt < maxRetry) {
    attempt += 1;
    const ordNo = await generateOrderNo();

    try {
      const created = await prisma.shopOrder.create({
        data: {
          ...data,
          ordNo, // 여기서 항상 새로 생성된 주문번호 사용
        },
      });

      return created;
    } catch (e: any) {
      // UNIQUE 제약조건 충돌 시 재시도 (ordNo 관련 충돌만)
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = JSON.stringify(e.meta?.target ?? '');
        if (target.includes('ordNo') || target.includes('ord_no')) {
          // 주문번호 중복이면 다음 루프로 넘어가서 새 번호로 재시도
          continue;
        }
      }

      // 그 외 에러는 그대로 던짐
      throw e;
    }
  }

  throw new Error('주문번호 생성에 실패했습니다. (재시도 초과)');
}
