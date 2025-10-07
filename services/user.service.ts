import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  DeleteInput,
  DeleteResult,
  DeleteAccountInput,
} from '@/types/user';
import { IUser } from '@/types/user';
import bcrypt from 'bcryptjs';
import type { CreateType } from '@/actions/user/create/schema';
import type { UpdateType } from '@/actions/user/update/schema';
import { UserRole } from '@prisma/client';

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
  const baseWhere: Prisma.UserWhereInput = {
    // role: { not: UserRole.ADMIN },
    isUse: typeof isUse === 'boolean' ? isUse : true,
    isVisible: typeof isVisible === 'boolean' ? isVisible : true,
  };

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.UserWhereInput = q
    ? {
        ...baseWhere,
        OR: [{ name: { contains: q } }, { email: { contains: q } }],
      }
    : {
        ...baseWhere,
        ...(name?.trim() ? { name: { contains: name.trim() } } : {}),
        ...(email?.trim() ? { email: { contains: email.trim() } } : {}),
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
  let keysetWhere: Prisma.UserWhereInput | undefined;
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
  const orderBy: Prisma.UserOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.UserWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.user.findMany({
    where: whereForPage,
    orderBy,
    take: safeLimit + 1,
    include: {
      _count: {
        select: { accounts: true },
      },
      profile: true,
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
    prisma.user.count({ where: baseWhere }),
    prisma.user.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(id: string): Promise<IUser> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.user.findUnique({
    where: { id },
    include: {
      accounts: { orderBy: { createdAt: 'desc' } },
      profile: true,
    },
  });

  if (!rs) throw new Error('NOT_FOUND');
  return rs;
}

/** 작성 */
export async function create(input: CreateType) {
  const {
    id,
    name,
    email,
    password,
    nick,
    phone,
    role,
    level,
    isUse = true,
    isVisible = true,
    profile = [],
  } = input;

  const exists = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${id}`);

  const passwordHash = await bcrypt.hash(password, 10);
  const levelNum = Number(level);

  const result = await prisma.$transaction(async (tx) => {
    const createData: any = {
      data: {
        id,
        name,
        email,
        nick,
        phone,
        role,
        level: levelNum,
        password: passwordHash,
        emailVerified: new Date(),
        signUpVerified: new Date(),
        isUse,
        isVisible,
      },
      include: {
        profile: true,
        accounts: true,
      },
    };

    // 파일
    if (profile && profile.length > 0) {
      const fileRecords = profile.map((f) => ({
        userId: id,
        name: f.name ?? '',
        url: f.url,
      }));
      createData.data.profile = { create: fileRecords };
    }

    const created = await tx.user.create(createData);

    // 관계 포함 최종 반환
    const withRelations = await tx.user.findUnique({
      where: { id: created.id },
      include: {
        profile: true,
        accounts: true,
      },
    });

    return withRelations!;
  });

  return result;
}

/** 수정 */
export async function update(input: UpdateType) {
  const {
    id,
    name,
    email,
    nick,
    role,
    phone,
    level,
    isUse,
    isVisible,
    profile,
    deleteFileUrls,
  } = input;

  const exist = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const levelNum = Number(level);

  const rs = await prisma.$transaction(async (tx) => {
    // 2) 파일 삭제 (프론트에서 제거한 URL만)
    if (deleteFileUrls && deleteFileUrls.length > 0) {
      await tx.userProfile.deleteMany({
        where: { userId: id, url: { in: deleteFileUrls } },
      });
    }

    // 3) 본문 업데이트 + 관계 include
    const data: any = {
      name,
      email,
      nick,
      role,
      phone,
      level: levelNum,
      isUse,
      isVisible,
    };

    // 3-1) 새 파일 추가 (기존과 중복 URL 제외)
    if (profile && profile.length > 0) {
      const existing = await tx.userProfile.findMany({
        where: { userId: id },
        select: { url: true },
      });
      const existingUrls = new Set(existing.map((f) => f.url));
      const newFiles = profile.filter((f) => f.url && !existingUrls.has(f.url));
      if (newFiles.length > 0) {
        data.profile = {
          create: newFiles.map((f) => ({
            name: f.name,
            url: f.url,
          })),
        };
      }
    }

    const updated = await tx.user.update({
      where: { id },
      data,
      include: {
        profile: true,
        accounts: true,
      },
    });

    return updated;
  });

  return rs;
}

/** 삭제 */
export async function remove(input: DeleteInput): Promise<DeleteResult> {
  const { id, ids, hard = false } = input;

  // 유효성
  if (!id && (!ids || ids.length === 0)) {
    throw new Error('MISSING_ID');
  }

  // Bulk
  if (ids && ids.length > 0) {
    return await prisma.$transaction(async (tx) => {
      // 관련 자식들 정리(파일/댓글/옵션) - FK가 id(todoId)면 in으로
      await tx.account.deleteMany({ where: { userId: { in: ids } } });
      await tx.userProfile.deleteMany({ where: { userId: { in: ids } } });

      if (hard) {
        const rs = await tx.user.deleteMany({ where: { id: { in: ids } } });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.user.updateMany({
          where: { id: { in: ids } },
          data: { isUse: false, isVisible: false },
        });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const todo = await prisma.user.findUnique({
    where: { id: id! },
    select: { id: true },
  });
  if (!todo) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    await tx.account.deleteMany({ where: { userId: id! } });
    await tx.userProfile.deleteMany({ where: { userId: id! } });

    if (hard) {
      const rs = await tx.user.delete({ where: { id: id! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.user.update({
        where: { id: id! },
        data: { isUse: false, isVisible: false },
      });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}

/** 삭제 */
export async function removeAccount(
  input: DeleteAccountInput,
): Promise<DeleteResult> {
  const { userId, idx, provider } = input;

  // 유효성
  if (!userId || !idx || !provider) {
    throw new Error('MISSING_PARAMETER');
  }

  console.log({ provider, userId, idx });

  // Single
  const exist = await prisma.account.findFirst({
    where: { provider, userId, idx },
    select: { idx: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    const rs = await tx.account.delete({ where: { idx: exist.idx } });
    return { mode: 'single', affected: rs ? 1 : 0 };
  });
}
