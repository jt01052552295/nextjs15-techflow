import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { b64e, b64d } from '@/lib/util';
import type {
  ListParams,
  ListResult,
  DeleteInput,
  DeleteResult,
  IBBSListRow,
} from '@/types/bbs';
import bcrypt from 'bcryptjs';
import type { CreateType } from '@/actions/bbs/create/schema';
import type { UpdateType } from '@/actions/bbs/update/schema';

/**
 * 목록: 커서 기반(keyset) + 정렬/검색/필터 + 카운트 2종 + 풀컬럼
 * - 정렬과 커서는 항상 일치
 * - tie-breaker는 idx
 * - Prisma 기본 cursor 옵션 대신, 복합 정렬 대응을 위해 where로 keyset 구현
 */
export async function list(params: ListParams = {}): Promise<ListResult> {
  const {
    q,
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
  const baseWhere: Prisma.BBSWhereInput = {
    isUse: typeof isUse === 'boolean' ? isUse : true,
    isVisible: typeof isVisible === 'boolean' ? isVisible : true,
  };

  // 통합 검색(q)이 들어오면 name/email OR 매칭. 없으면 기존 name/email 개별 필드 사용
  const filteredWhere: Prisma.BBSWhereInput = q
    ? {
        ...baseWhere,
        OR: [
          { subject: { contains: q } },
          { userId: { contains: q } },
          { name: { contains: q } },
        ],
      }
    : {
        ...baseWhere,
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
  let keysetWhere: Prisma.BBSWhereInput | undefined;
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
  const orderBy: Prisma.BBSOrderByWithRelationInput[] = [
    { [sortBy]: order },
    { idx: order }, // tie-breaker도 동일 방향
  ];

  const whereForPage: Prisma.BBSWhereInput = keysetWhere
    ? { AND: [filteredWhere, keysetWhere] }
    : filteredWhere;

  const rows = await prisma.bBS.findMany({
    where: whereForPage,
    orderBy,
    take: safeLimit + 1,
    include: {
      _count: {
        select: { comments: true, likes: true, files: true },
      },
      board: true,
    },
  });

  const hasMore = rows.length > safeLimit;
  const sliced = hasMore ? rows.slice(0, safeLimit) : rows;

  const items: IBBSListRow[] = sliced.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  let nextCursor: string | undefined;
  if (hasMore) {
    const last = items[items.length - 1] as any;
    nextCursor = b64e({ sortValue: last[sortBy], idx: last.idx });
  }

  const [totalAll, totalFiltered] = await Promise.all([
    prisma.bBS.count({ where: baseWhere }),
    prisma.bBS.count({ where: filteredWhere }),
  ]);

  return { items, nextCursor, totalAll, totalFiltered };
}

/** 보기 */
export async function show(uid: string): Promise<IBBSListRow> {
  // 먼저 존재 확인 (선택)
  const exists = await prisma.bBS.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.bBS.findUnique({
    where: { uid },
    include: {
      _count: {
        select: { comments: true, likes: true, files: true },
      },
      // 필요 시 조건/정렬 조절
      comments: { orderBy: { createdAt: 'desc' } },
      files: { orderBy: { createdAt: 'desc' } },
      board: true,
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!rs) throw new Error('NOT_FOUND');

  const dto: IBBSListRow = {
    ...rs,
    createdAt: rs.createdAt.toISOString(),
    updatedAt: rs.updatedAt.toISOString(),
  };
  return dto;
}

/** 작성 */
export async function create(input: CreateType) {
  const {
    uid,
    bdTable,
    userId = null,
    name,
    password,
    notice = false,
    secret = false,
    category = '',
    subject,
    content,
    contentA = null,
    ipAddress = null,
    link1 = '',
    link2 = '',
    isUse = true,
    isVisible = true,
    files = [],
  } = input;

  const exists = await prisma.bBS.findUnique({
    where: { uid },
    select: { uid: true },
  });
  if (exists) throw new Error(`UID_ALREADY_USED:${uid}`);

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const createData: any = {
      data: {
        uid,
        bdTable,
        userId,
        name,
        password: passwordHash,
        notice,
        secret,
        category,
        subject,
        content,
        contentA,
        ipAddress,
        link1,
        link2,
        isUse,
        isVisible,
      },
      include: {
        comments: true,
        files: true,
        likes: true,
      },
    };

    // 파일
    if (files && files.length > 0) {
      const fileRecords = files.map((f) => ({
        name: f.name ?? '',
        originalName: f.originalName,
        url: f.url,
        size: f.size,
        ext: f.ext,
        type: f.type,
        bdTable,
      }));
      createData.data.files = { create: fileRecords };
    }

    const created = await tx.bBS.create(createData);

    // 정렬 기본값: sortOrder = idx
    await tx.bBS.update({
      where: { idx: created.idx },
      data: { sortOrder: created.idx },
    });

    // 관계 포함 최종 반환
    const withRelations = await tx.bBS.findUnique({
      where: { uid: created.uid },
      include: {
        comments: true,
        files: true,
        likes: true,
        board: true,
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
    bdTable,
    userId = null,
    name,
    password,
    notice = false,
    secret = false,
    category = '',
    subject,
    content,
    contentA = null,
    ipAddress = null,
    link1 = '',
    link2 = '',
    isUse,
    isVisible,
    files,
    deleteFileUrls,
  } = input;

  const exist = await prisma.bBS.findUnique({
    where: { uid, cid },
    select: { uid: true, cid: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  const rs = await prisma.$transaction(async (tx) => {
    // 2) 파일 삭제 (프론트에서 제거한 URL만)
    if (deleteFileUrls && deleteFileUrls.length > 0) {
      await tx.bBSFile.deleteMany({
        where: { pid: uid, url: { in: deleteFileUrls } },
      });
    }

    // 3) 본문 업데이트 + 관계 include
    const data: any = {
      bdTable,
      userId,
      name,
      notice,
      secret,
      category,
      subject,
      content,
      contentA,
      ipAddress,
      link1,
      link2,
      isUse,
      isVisible,
    };

    // 3-1) 새 파일 추가 (기존과 중복 URL 제외)
    if (files && files.length > 0) {
      const existing = await tx.bBSFile.findMany({
        where: { pid: uid },
        select: { url: true },
      });
      const existingUrls = new Set(existing.map((f) => f.url));
      const newFiles = files.filter((f) => f.url && !existingUrls.has(f.url));
      if (newFiles.length > 0) {
        data.files = {
          create: newFiles.map((f) => ({
            name: f.name ?? '',
            originalName: f.originalName,
            url: f.url,
            size: f.size,
            ext: f.ext,
            type: f.type,
            bdTable,
          })),
        };
      }
    }

    const updated = await tx.bBS.update({
      where: { uid },
      data,
      include: {
        _count: {
          select: { comments: true, likes: true, files: true },
        },
        board: true,
      },
    });

    const dto: IBBSListRow = {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
    return dto;
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
    const posts = await prisma.bBS.findMany({
      where: { uid: { in: uids } },
      select: { uid: true, bdTable: true, idx: true },
    });

    const postUids = posts.map((p) => p.uid);
    const postIdxs = posts.map((p) => p.idx);
    const bdTables = Array.from(new Set(posts.map((p) => p.bdTable))); // ✅ 오타 수정

    return await prisma.$transaction(async (tx) => {
      await tx.bBSFile.deleteMany({
        where: { bdTable: { in: bdTables }, pid: { in: postUids } },
      });
      await tx.bBSLike.deleteMany({
        where: { bdTable: { in: bdTables }, parentIdx: { in: postIdxs } },
      });
      const comments = await tx.bBSComment.findMany({
        where: { bdTable: { in: bdTables }, pid: { in: postUids } },
        select: { idx: true },
      });
      const commentIdxs = comments.map((c) => c.idx);
      if (commentIdxs.length > 0) {
        await tx.bBSCommentLike.deleteMany({
          where: { bdTable: { in: bdTables }, parentIdx: { in: commentIdxs } },
        });
      }

      // 5) 댓글(게시글 uid 기준)
      await tx.bBSComment.deleteMany({
        where: { bdTable: { in: bdTables }, pid: { in: postUids } },
      });

      if (hard) {
        const rs = await tx.bBS.deleteMany({ where: { uid: { in: uids } } });
        return { mode: 'bulk', affected: rs.count };
      } else {
        const rs = await tx.bBS.updateMany({
          where: { uid: { in: uids } },
          data: { isUse: false, isVisible: false },
        });
        return { mode: 'bulk', affected: rs.count };
      }
    });
  }

  // Single
  const exist = await prisma.bBS.findUnique({
    where: { uid: uid! },
    select: { uid: true, bdTable: true, idx: true },
  });
  if (!exist) throw new Error('NOT_FOUND');

  return await prisma.$transaction(async (tx) => {
    await tx.bBSFile.deleteMany({
      where: { bdTable: exist.bdTable, pid: exist.uid },
    });
    await tx.bBSLike.deleteMany({
      where: { bdTable: exist.bdTable, parentIdx: exist.idx },
    });

    const commentIdxs = (
      await tx.bBSComment.findMany({
        where: { bdTable: exist.bdTable, pid: exist.uid },
        select: { idx: true },
      })
    ).map((c) => c.idx);

    if (commentIdxs.length > 0) {
      await tx.bBSCommentLike.deleteMany({
        where: { bdTable: exist.bdTable, parentIdx: { in: commentIdxs } },
      });
    }
    await tx.bBSComment.deleteMany({
      where: { bdTable: exist.bdTable, pid: exist.uid },
    });

    if (hard) {
      const rs = await tx.bBS.delete({ where: { uid: uid! } });
      return { mode: 'single', affected: rs ? 1 : 0 };
    } else {
      const rs = await tx.bBS.update({
        where: { uid: uid! },
        data: { isUse: false, isVisible: false },
      });
      return { mode: 'single', affected: rs ? 1 : 0 };
    }
  });
}
