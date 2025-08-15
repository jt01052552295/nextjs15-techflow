import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  DeleteInput,
  DeleteResult,
} from '@/types/practice';
import { ITodosPart } from '@/types/todos';
import bcrypt from 'bcryptjs';
import type { CreateType } from '@/actions/practice/create/schema';
import type { UpdateType } from '@/actions/practice/update/schema';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    name,
    email,
    dateType,
    startDate,
    endDate,
    isUse,
    isVisible,

    sortBy = 'createdAt',
    order = 'desc',

    limit = 20,
    cursor,
  } = params;

  const safeLimit = Math.min(Math.max(+limit || 20, 1), 100);

  // ───────────────────────────────────
  // where (검색/필터)
  // ───────────────────────────────────
  const baseWhere: Prisma.TodosWhereInput = {
    ...(typeof isUse === 'boolean' && { isUse }),
    ...(typeof isVisible === 'boolean' && { isVisible }),
  };

  const filteredWhere: Prisma.TodosWhereInput = {
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
  let keysetWhere: Prisma.TodosWhereInput | undefined;
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
  const orderBy: Prisma.TodosOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.TodosWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.todos.findMany({
    where: whereForPage,
    orderBy,
    take: safeLimit + 1, // +1로 다음 페이지 유무 확인
    include: {
      _count: {
        select: {
          TodosComment: true,
          TodosFile: true,
          TodosOption: true,
        },
      },
      TodosFile: {
        orderBy: { createdAt: 'desc' },
        take: 1,
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
    prisma.todos.count({ where: baseWhere }),
    prisma.todos.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<ITodosPart> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.todos.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.todos.findUnique({
    where: { uid },
    include: {
      // 필요 시 조건/정렬 조절
      TodosComment: { orderBy: { createdAt: 'desc' } },
      TodosFile: { orderBy: { createdAt: 'desc' } },
      TodosOption: true,
    },
  });

  if (!rs) throw new Error('NOT_FOUND');
  return rs;
}

/** 작성 */
export async function create(input: CreateType) {
  const {
    uid,
    name,
    email,
    content = null,
    content2 = null,
    gender = null,
    ipAddress = null,
    isUse = true,
    isVisible = true,
    todoFile = [],
    todoOption = [],
  } = input;

  const exists = await prisma.todos.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${uid}`);

  const passwordHash = await bcrypt.hash('1111', 10);

  const result = await prisma.$transaction(async (trx) => {
    const createData: any = {
      data: {
        uid,
        name,
        email,
        gender,
        content,
        content2,
        ipAddress,
        password: passwordHash,
        isUse,
        isVisible,
      },
      include: {
        TodosComment: true,
        TodosFile: true,
        TodosOption: true,
      },
    };

    // 파일
    if (todoFile && todoFile.length > 0) {
      const fileRecords = todoFile.map((f) => ({
        name: f.name ?? '',
        originalName: f.originalName,
        url: f.url,
        size: f.size,
        ext: f.ext,
        type: f.type,
      }));
      createData.data.TodosFile = { create: fileRecords };
    }

    // 옵션
    if (todoOption && todoOption.length > 0) {
      const optionRecords = todoOption.map((o) => ({
        name: o.name,
        age: o.age,
        gender: o.gender,
      }));
      createData.data.TodosOption = { create: optionRecords };
    }

    const created = await trx.todos.create(createData);

    // 정렬 기본값: sortOrder = idx
    await trx.todos.update({
      where: { idx: created.idx },
      data: { sortOrder: created.idx },
    });

    // 관계 포함 최종 반환
    const withRelations = await trx.todos.findUnique({
      where: { uid: created.uid },
      include: {
        TodosComment: true,
        TodosFile: true,
        TodosOption: true,
      },
    });

    return withRelations!;
  });

  return result;
}

/** 수정 */
export async function update(input: UpdateType) {
  const {
    uid,
    cid,
    name,
    email,
    content,
    content2,
    gender,
    ipAddress,
    isUse,
    isVisible,
    todoFile,
    todoOption,
    deleteOptionUids,
    deleteFileUrls,
  } = input;

  const exist = await prisma.todos.findUnique({
    where: { uid, cid },
    select: { uid: true, cid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (tx) => {
    // 1) 옵션 삭제
    if (deleteOptionUids && deleteOptionUids.length > 0) {
      await tx.todosOption.deleteMany({
        where: { uid: { in: deleteOptionUids } },
      });
    }

    // 2) 파일 삭제 (프론트에서 제거한 URL만)
    if (deleteFileUrls && deleteFileUrls.length > 0) {
      await tx.todosFile.deleteMany({
        where: { todoId: uid, url: { in: deleteFileUrls } },
      });
    }

    // 3) 본문 업데이트 + 관계 include
    const data: any = {
      name,
      email,
      gender,
      content,
      content2,
      ipAddress,
      isUse,
      isVisible,
    };

    // 3-1) 새 파일 추가 (기존과 중복 URL 제외)
    if (todoFile && todoFile.length > 0) {
      const existing = await tx.todosFile.findMany({
        where: { todoId: uid },
        select: { url: true },
      });
      const existingUrls = new Set(existing.map((f) => f.url));
      const newFiles = todoFile.filter(
        (f) => f.url && !existingUrls.has(f.url),
      );
      if (newFiles.length > 0) {
        data.TodosFile = {
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
    if (todoOption && todoOption.length > 0) {
      const updateOptionRecords = todoOption
        .filter(
          (
            o,
          ): o is { uid: string; name: string; age: number; gender: string } =>
            !!o.uid,
        )
        .map((o) => ({
          where: { uid: o.uid },
          data: { name: o.name, age: o.age, gender: o.gender },
        }));

      const createOptionRecords = todoOption
        .filter((o) => !o.uid)
        .map((o) => ({ name: o.name, age: o.age, gender: o.gender }));

      data.TodosOption = {
        ...(updateOptionRecords.length > 0
          ? { update: updateOptionRecords }
          : {}),
        ...(createOptionRecords.length > 0
          ? { create: createOptionRecords }
          : {}),
      };
    }

    const updated = await tx.todos.update({
      where: { uid },
      data,
      include: {
        TodosComment: true,
        TodosFile: true,
        TodosOption: true,
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
      // 관련 자식들 정리(파일/댓글/옵션) - FK가 uid(todoId)면 in으로
      await tx.todosFile.deleteMany({ where: { todoId: { in: uids } } });
      await tx.todosComment.deleteMany({ where: { todoId: { in: uids } } });
      await tx.todosOption.deleteMany({ where: { todoId: { in: uids } } });

      if (hard) {
        const rs = await tx.todos.deleteMany({ where: { uid: { in: uids } } });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.todos.updateMany({
          where: { uid: { in: uids } },
          data: { isUse: false, isVisible: false },
        });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const todo = await prisma.todos.findUnique({
    where: { uid: uid! },
    select: { uid: true },
  });
  if (!todo) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    await tx.todosFile.deleteMany({ where: { todoId: uid! } });
    await tx.todosComment.deleteMany({ where: { todoId: uid! } });
    await tx.todosOption.deleteMany({ where: { todoId: uid! } });

    if (hard) {
      const rs = await tx.todos.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.todos.update({
        where: { uid: uid! },
        data: { isUse: false, isVisible: false },
      });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}
