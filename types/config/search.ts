import type { ListParams } from '@/types/config';

// 커서 제외 타입
export type ConfigBaseParams = Omit<ListParams, 'cursor'>;

export const DEFAULTS: ConfigBaseParams = {
  sortBy: 'sortOrder',
  order: 'desc',
  limit: 20,
};

const sortBySet = new Set(['idx', 'CNFname', 'sortOrder']);
const orderSet = new Set(['asc', 'desc']);

export function parseBool(v?: string): boolean | undefined {
  if (v === 'true') return true;
  if (v === 'false') return false;
  return undefined;
}

export function toBaseParamsFromSearch(sp: URLSearchParams): ConfigBaseParams {
  const sortBy = sp.get('sortBy') ?? DEFAULTS.sortBy!;
  const order = sp.get('order') ?? DEFAULTS.order!;
  const limit = Number(sp.get('limit') ?? DEFAULTS.limit);

  return {
    q: sp.get('q') || undefined,
    CNFname: sp.get('CNFname') || undefined,
    CNFvalue: sp.get('CNFvalue') || undefined,
    CNFvalue_en: sp.get('CNFvalue_en') || undefined,
    CNFvalue_ja: sp.get('CNFvalue_ja') || undefined,
    CNFvalue_zh: sp.get('CNFvalue_zh') || undefined,
    sortBy: sortBySet.has(sortBy) ? (sortBy as any) : DEFAULTS.sortBy,
    order: orderSet.has(order) ? (order as any) : DEFAULTS.order,
    limit: Number.isFinite(limit)
      ? Math.min(Math.max(limit, 1), 100)
      : DEFAULTS.limit,
  };
}

export function toSearchParamsFromBase(p: ConfigBaseParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (p.q) sp.set('q', p.q);
  if (p.CNFname) sp.set('CNFname', p.CNFname);
  if (p.CNFvalue) sp.set('CNFvalue', p.CNFvalue);
  if (p.CNFvalue_en) sp.set('CNFvalue_en', p.CNFvalue_en);
  if (p.CNFvalue_ja) sp.set('CNFvalue_ja', p.CNFvalue_ja);
  if (p.CNFvalue_zh) sp.set('CNFvalue_zh', p.CNFvalue_zh);
  if (p.sortBy) sp.set('sortBy', p.sortBy);
  if (p.order) sp.set('order', p.order);
  if (p.limit) sp.set('limit', String(p.limit));
  return sp;
}

// 빈 문자열/공백을 undefined로 정리(안전용)
const norm = (v?: string) => (v && v.trim() ? v.trim() : undefined);

export function isSameBaseParams(a: ConfigBaseParams, b: ConfigBaseParams) {
  return (
    norm(a.q) === norm(b.q) &&
    norm(a.CNFname) === norm(b.CNFname) &&
    norm(a.CNFvalue) === norm(b.CNFvalue) &&
    norm(a.CNFvalue_en) === norm(b.CNFvalue_en) &&
    norm(a.CNFvalue_ja) === norm(b.CNFvalue_ja) &&
    norm(a.CNFvalue_zh) === norm(b.CNFvalue_zh) &&
    (a.sortBy ?? 'sortOrder') === (b.sortBy ?? 'sortOrder') &&
    (a.order ?? 'desc') === (b.order ?? 'desc') &&
    (a.limit ?? 20) === (b.limit ?? 20)
  );
}
