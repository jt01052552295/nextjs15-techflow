import type { ListParams } from '@/types/payment';

// 커서 제외 타입
export type PaymentBaseParams = Omit<ListParams, 'cursor'>;

export const DEFAULTS: PaymentBaseParams = {
  sortBy: 'idx',
  order: 'desc',
  limit: 20,
};

const sortBySet = new Set(['idx', 'userId']);
const orderSet = new Set(['asc', 'desc']);

export function parseBool(v?: string): boolean | undefined {
  if (v === 'true') return true;
  if (v === 'false') return false;
  return undefined;
}

export function toBaseParamsFromSearch(sp: URLSearchParams): PaymentBaseParams {
  const sortBy = sp.get('sortBy') ?? DEFAULTS.sortBy!;
  const order = sp.get('order') ?? DEFAULTS.order!;
  const limit = Number(sp.get('limit') ?? DEFAULTS.limit);

  return {
    q: sp.get('q') || undefined,
    dateType: (sp.get('dateType') as any) || undefined, // 'createdAt' | 'updatedAt'
    startDate: sp.get('startDate') || undefined,
    endDate: sp.get('endDate') || undefined,
    isUse: parseBool(sp.get('isUse') || undefined),
    isVisible: parseBool(sp.get('isVisible') || undefined),
    sortBy: sortBySet.has(sortBy) ? (sortBy as any) : DEFAULTS.sortBy,
    order: orderSet.has(order) ? (order as any) : DEFAULTS.order,
    limit: Number.isFinite(limit)
      ? Math.min(Math.max(limit, 1), 100)
      : DEFAULTS.limit,
  };
}

export function toSearchParamsFromBase(p: PaymentBaseParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (p.q) sp.set('q', p.q);
  // if (p.name) sp.set('name', p.name);
  // if (p.email) sp.set('email', p.email);
  if (p.dateType) sp.set('dateType', p.dateType);
  if (p.startDate) sp.set('startDate', p.startDate);
  if (p.endDate) sp.set('endDate', p.endDate);
  if (typeof p.isUse === 'boolean') sp.set('isUse', String(p.isUse));
  if (typeof p.isVisible === 'boolean')
    sp.set('isVisible', String(p.isVisible));
  if (p.sortBy) sp.set('sortBy', p.sortBy);
  if (p.order) sp.set('order', p.order);
  if (p.limit) sp.set('limit', String(p.limit));
  return sp;
}

// 빈 문자열/공백을 undefined로 정리(안전용)
const norm = (v?: string) => (v && v.trim() ? v.trim() : undefined);

export function isSameBaseParams(a: PaymentBaseParams, b: PaymentBaseParams) {
  return (
    norm(a.q) === norm(b.q) &&
    // norm(a.name) === norm(b.name) &&
    // norm(a.email) === norm(b.email) &&
    (a.dateType ?? '') === (b.dateType ?? '') &&
    norm(a.startDate) === norm(b.startDate) &&
    norm(a.endDate) === norm(b.endDate) &&
    (a.isUse ?? null) === (b.isUse ?? null) &&
    (a.isVisible ?? null) === (b.isVisible ?? null) &&
    (a.sortBy ?? 'idx') === (b.sortBy ?? 'idx') &&
    (a.order ?? 'desc') === (b.order ?? 'desc') &&
    (a.limit ?? 20) === (b.limit ?? 20)
  );
}
