import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  DeleteInput,
  DeleteResult,
} from '@/types/shop/item';
import { IShopItem } from '@/types/shop/item';
import type { CreateType } from '@/actions/shop/item/create/schema';
import type { UpdateType } from '@/actions/shop/item/update/schema';

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
    code,
    dateType,
    startDate,
    endDate,
    isUse,
    isVisible,

    sortBy = 'sortOrder',
    order = 'desc',

    limit = 20,
    cursor,
  } = params;

  const safeLimit = Math.min(Math.max(+limit || 20, 1), 100);

  // ───────────────────────────────────
  // where (검색/필터)
  // ───────────────────────────────────
  const baseWhere: Prisma.ShopItemWhereInput = {
    isUse: typeof isUse === 'boolean' ? isUse : true,
    isVisible: typeof isVisible === 'boolean' ? isVisible : true,
  };

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.ShopItemWhereInput = q
    ? {
        ...baseWhere,
        OR: [{ name: { contains: q } }, { code: { contains: q } }],
      }
    : {
        ...baseWhere,
        ...(name?.trim() ? { name: { contains: name.trim() } } : {}),
        ...(code?.trim() ? { code: { contains: code.trim() } } : {}),
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
  let keysetWhere: Prisma.ShopItemWhereInput | undefined;
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
  const orderBy: Prisma.ShopItemOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.ShopItemWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.shopItem.findMany({
    where: whereForPage,
    orderBy,
    take: safeLimit + 1,
    include: {
      _count: {
        select: {
          ShopItemFile: true,
          ShopItemOption: true,
          ShopItemSupply: true,
        },
      },
      ShopCategory: true,
      ShopItemFile: true,
      ShopItemOption: true,
      ShopItemSupply: true,
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
    prisma.shopItem.count({ where: baseWhere }),
    prisma.shopItem.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<IShopItem> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.shopItem.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.shopItem.findUnique({
    where: { uid },
    include: {
      // 필요 시 조건/정렬 조절
      ShopCategory: true,
      ShopItemFile: true,
      ShopItemOption: true,
      ShopItemSupply: true,
    },
  });

  if (!rs) throw new Error('NOT_FOUND');
  return rs;
}

/** 작성 */
export async function create(input: CreateType) {
  const { item, files, options = [], supplies = [] } = input;

  // 카테고리 존재 확인
  const categoryExists = await prisma.shopCategory.findUnique({
    where: { code: item.categoryCode },
  });

  if (!categoryExists) {
    throw new Error(`카테고리를 찾을 수 없습니다: ${item.categoryCode}`);
  }

  const result = await prisma.$transaction(async (tx) => {
    const createData: any = {
      data: {
        uid: item.uid,
        shopId: item.shopId ?? 0,

        code: item.code,
        categoryCode: item.categoryCode,

        name: item.name,
        desc1: item.desc1 ?? '',

        basicPrice: item.basicPrice ?? 0,
        basicPriceDc: item.basicPriceDc ?? 0,
        salePrice: item.salePrice ?? 0,

        basicDesc: item.basicDesc ?? null,
        etcDesc: item.etcDesc ?? null,

        useDuration: item.useDuration ?? 0,

        stock: item.stock ?? 0,

        isUse: item.isUse ?? true,
        isVisible: item.isVisible ?? true,
        isSoldout: item.isSoldout ?? false,

        orderMinimumCnt: item.orderMinimumCnt ?? 0,
        orderMaximumCnt: item.orderMaximumCnt ?? 0,
      },
      include: {
        ShopCategory: true,
        ShopItemFile: true,
        ShopItemOption: true,
        ShopItemSupply: true,
      },
    };

    // 파일
    if (files && files.length > 0) {
      const fileRecords = files.map((f) => ({
        pid: item.uid,
        name: f.name ?? '',
        originalName: f.originalName,
        url: f.url,
        size: f.size,
        ext: f.ext,
        type: f.type,
      }));
      createData.data.ShopItemFile = { create: fileRecords };
    }

    // 옵션
    if (options && options.length > 0) {
      const optionRecords = options.map((o) => ({
        pid: item.uid,
        gubun: o.gubun ?? '',
        parentId: o.parentId ?? 0,
        choiceType: o.choiceType ?? '',
        name: o.name,
        price: o.price ?? 0,
        stock: o.stock ?? 0,
        buyMin: o.buyMin ?? 0,
        buyMax: o.buyMax ?? 0,
        isUse: o.isUse ?? true,
        isVisible: o.isVisible ?? true,
        isSoldout: o.isSoldout ?? false,
      }));
      createData.data.ShopItemOption = { create: optionRecords };
    }

    // 추가구성
    if (supplies && supplies.length > 0) {
      const supplyRecords = supplies.map((s) => ({
        pid: item.uid,
        gubun: s.gubun ?? '',
        parentId: s.parentId ?? 0,
        choiceType: s.choiceType ?? '',
        name: s.name,
        price: s.price ?? 0,
        stock: s.stock ?? 0,
        isUse: s.isUse ?? true,
        isVisible: s.isVisible ?? true,
        isSoldout: s.isSoldout ?? false,
      }));
      createData.data.ShopItemSupply = { create: supplyRecords };
    }

    const created = await tx.shopItem.create(createData);

    // 정렬 기본값: sortOrder = idx
    await tx.shopItem.update({
      where: { idx: created.idx },
      data: { sortOrder: created.idx },
    });

    // 관계 포함 최종 반환
    const withRelations = await tx.shopItem.findUnique({
      where: { uid: created.uid },
      include: {
        ShopCategory: true,
        ShopItemFile: true,
        ShopItemOption: true,
        ShopItemSupply: true,
      },
    });

    return withRelations!;
  });

  return result;
}

/** 수정 */
export async function update(input: UpdateType) {
  const {
    item,
    files,
    options = [],
    supplies = [],
    deleteOptionUids,
    deleteSupplyUids,
    deleteFileUrls,
  } = input;

  const exist = await prisma.shopItem.findUnique({
    where: { uid: item.uid, cid: item.cid },
    select: { uid: true, cid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (tx) => {
    // 1) 옵션 삭제
    if (deleteOptionUids && deleteOptionUids.length > 0) {
      await tx.shopItemOption.deleteMany({
        where: { uid: { in: deleteOptionUids } },
      });
    }

    if (deleteSupplyUids && deleteSupplyUids.length > 0) {
      await tx.shopItemSupply.deleteMany({
        where: { uid: { in: deleteSupplyUids } },
      });
    }

    // 2) 파일 삭제 (프론트에서 제거한 URL만)
    if (deleteFileUrls && deleteFileUrls.length > 0) {
      await tx.shopItemFile.deleteMany({
        where: { pid: item.uid, url: { in: deleteFileUrls } },
      });
    }

    // 3) 본문 업데이트 + 관계 include
    const data: any = {
      item: {
        shopId: item.shopId ?? 0,

        code: item.code ?? '',
        categoryCode: item.categoryCode ?? '',

        name: item.name,
        nameEn: item.nameEn ?? '',
        desc1: item.desc1 ?? '',

        basicPrice: item.basicPrice ?? 0,
        basicPriceDc: item.basicPriceDc ?? 0,
        salePrice: item.salePrice ?? 0,

        basicDesc: item.basicDesc ?? null,
        etcDesc: item.etcDesc ?? null,

        useBasicPeople: item.useBasicPeople ?? 0,
        useAccount: item.useAccount ?? 0,
        useMaxPeople: item.useMaxPeople ?? 0,
        useMaxSign: item.useMaxSign ?? 0,
        useMaxUpload: item.useMaxUpload ?? 0,
        useDuration: item.useDuration ?? 0,

        rSend: item.rSend ?? false,
        stock: item.stock ?? 0,

        ymd: item.ymd ?? '',
        his: item.his ?? '',

        isUse: item.isUse ?? false,
        isVisible: item.isVisible ?? false,
        isNft: item.isNft ?? false,
        isSoldout: item.isSoldout ?? false,

        orderMinimumCnt: item.orderMinimumCnt ?? 0,
        orderMaximumCnt: item.orderMaximumCnt ?? 0,
        sortOrder: item.sortOrder ?? 0,
      },
    };

    // 3-1) 새 파일 추가 (기존과 중복 URL 제외)
    if (files && files.length > 0) {
      const existing = await tx.shopItemFile.findMany({
        where: { pid: item.uid },
        select: { url: true },
      });
      const existingUrls = new Set(existing.map((f) => f.url));
      const newFiles = files.filter((f) => f.url && !existingUrls.has(f.url));
      if (newFiles.length > 0) {
        data.ShopItemFile = {
          create: newFiles.map((f) => ({
            name: f.name ?? '',
            originalName: f.originalName,
            url: f.url,
            size: f.size,
            ext: f.ext,
            type: f.type,
          })),
        };
      }
    }

    // 3-2) 옵션 create/update 분기
    if (options && options.length > 0) {
      const updateOptionRecords = options
        .filter((o) => !!o.uid)
        .map((o) => ({
          where: { uid: o.uid! },
          data: {
            gubun: o.gubun ?? '',
            parentId: o.parentId ?? 0,
            choiceType: o.choiceType ?? '',
            name: o.name,
            price: o.price ?? 0,
            stock: o.stock ?? 0,
            buyMin: o.buyMin ?? 0,
            buyMax: o.buyMax ?? 0,
            isUse: o.isUse ?? true,
            isVisible: o.isVisible ?? true,
            isSoldout: o.isSoldout ?? false,
          },
        }));

      const createOptionRecords = options
        .filter((o) => !o.uid)
        .map((o) => ({
          gubun: o.gubun ?? '',
          parentId: o.parentId ?? 0,
          choiceType: o.choiceType ?? '',
          name: o.name,
          price: o.price ?? 0,
          stock: o.stock ?? 0,
          buyMin: o.buyMin ?? 0,
          buyMax: o.buyMax ?? 0,
          isUse: o.isUse ?? true,
          isVisible: o.isVisible ?? true,
          isSoldout: o.isSoldout ?? false,
        }));

      data.ShopItemOption = {
        ...(updateOptionRecords.length > 0
          ? { update: updateOptionRecords }
          : {}),
        ...(createOptionRecords.length > 0
          ? { create: createOptionRecords }
          : {}),
      };
    }

    // 3-3) 추가 create/update 분기
    if (supplies && supplies.length > 0) {
      const updateSupplyRecords = supplies
        .filter((s) => !!s.uid)
        .map((s) => ({
          where: { uid: s.uid! },
          data: {
            gubun: s.gubun ?? '',
            parentId: s.parentId ?? 0,
            choiceType: s.choiceType ?? '',
            name: s.name,
            price: s.price ?? 0,
            stock: s.stock ?? 0,
            isUse: s.isUse ?? false,
            isVisible: s.isVisible ?? false,
            isSoldout: s.isSoldout ?? false,
          },
        }));

      const createSupplyRecords = supplies
        .filter((s) => !s.uid)
        .map((s) => ({
          gubun: s.gubun ?? '',
          parentId: s.parentId ?? 0,
          choiceType: s.choiceType ?? '',
          name: s.name,
          price: s.price ?? 0,
          stock: s.stock ?? 0,
          isUse: s.isUse ?? true,
          isVisible: s.isVisible ?? true,
          isSoldout: s.isSoldout ?? false,
        }));

      data.ShopItemSupply = {
        ...(updateSupplyRecords.length > 0
          ? { update: updateSupplyRecords }
          : {}),
        ...(createSupplyRecords.length > 0
          ? { create: createSupplyRecords }
          : {}),
      };
    }

    const updated = await tx.shopItem.update({
      where: { uid: item.uid },
      data,
      include: {
        ShopCategory: true,
        ShopItemFile: true,
        ShopItemOption: true,
        ShopItemSupply: true,
      },
    });

    return updated;
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
      await tx.shopItemFile.deleteMany({ where: { pid: { in: uids } } });
      await tx.shopItemOption.deleteMany({ where: { pid: { in: uids } } });
      await tx.shopItemSupply.deleteMany({ where: { pid: { in: uids } } });

      if (hard) {
        const rs = await tx.shopItem.deleteMany({
          where: { uid: { in: uids } },
        });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.shopItem.updateMany({
          where: { uid: { in: uids } },
          data: { isUse: false, isVisible: false },
        });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const row = await prisma.shopItem.findUnique({
    where: { uid: uid! },
    select: { uid: true },
  });
  if (!row) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    await tx.shopItemFile.deleteMany({ where: { pid: uid! } });
    await tx.shopItemOption.deleteMany({ where: { pid: uid! } });
    await tx.shopItemSupply.deleteMany({ where: { pid: uid! } });

    if (hard) {
      const rs = await tx.shopItem.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.shopItem.update({
        where: { uid: uid! },
        data: { isUse: false, isVisible: false },
      });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}
