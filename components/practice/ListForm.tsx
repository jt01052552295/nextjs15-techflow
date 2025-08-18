'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { usePracticeInfinite } from '@/hooks/react-query/usePractice';
import ListRowSkeleton from './ListRowSkeleton';
import ListRow from './ListRow';
import type { ITodosListRow } from '@/types/todos';
import ScrollToTopButton from '../common/ScrollToTopButton';

import {
  DEFAULTS,
  isSameBaseParams,
  toSearchParamsFromBase,
  type PracticeBaseParams,
} from '@/types/practice/search';
import SearchForm from './SearchForm';

type Props = { baseParams: PracticeBaseParams };

const ListForm = ({ baseParams }: Props) => {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  // 1) URL → baseParams
  const [params, setParams] = useState<PracticeBaseParams>(baseParams);
  const [, setForm] = useState<PracticeBaseParams>(baseParams);

  const syncedOnceRef = useRef(false);
  useEffect(() => {
    if (!syncedOnceRef.current) {
      setParams(baseParams);
      setForm(baseParams);
      syncedOnceRef.current = true; // ✅ 최초 1회만 서버값 반영
    }
  }, [baseParams]);

  const applyParams = (next: PracticeBaseParams) => {
    if (isSameBaseParams(next, params)) return;
    setParams(next);
    const qs = toSearchParamsFromBase(next);
    router.replace(`${pathname}?${qs.toString()}`);
  };

  const handleApply = (next: PracticeBaseParams) => applyParams(next);
  const handleReset = () => applyParams(DEFAULTS);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = usePracticeInfinite(params);

  // 평탄화 + 중복 제거(커서 경계에서 같은 uid가 들어오는 상황 방지)
  const items: ITodosListRow[] = useMemo(() => {
    const list = data?.pages.flatMap((p) => p.items) ?? [];
    const seen = new Set<string>();
    return list.filter((row) =>
      seen.has(row.uid) ? false : (seen.add(row.uid), true),
    );
  }, [data]);

  const totalAll = data?.pages?.[0]?.totalAll ?? 0;
  const totalFiltered = data?.pages?.[0]?.totalFiltered ?? 0;

  // 자동 더보기
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) fetchNextPage();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="position-relative">
      <SearchForm
        value={params}
        onApply={handleApply}
        onReset={handleReset}
        loading={isLoading && !data}
      />
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          All: {totalAll} / Filtered: {totalFiltered}
        </div>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => refetch()}
        >
          새로고침
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th className="text-center">{t('columns.todos.uid')}</th>
              <th className="text-center">{t('columns.todos.name')}</th>
              <th className="text-center">{t('columns.todos.email')}</th>
              <th className="text-center">{t('columns.todos.createdAt')}</th>
              <th className="text-center">{t('columns.todos.updatedAt')}</th>
              <th className="text-center">Counts</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              items.map((row: ITodosListRow) => (
                <ListRow key={row.idx} row={row} />
              ))}
            {isLoading &&
              [...Array(20)].map((_, i) => (
                <ListRowSkeleton key={`skeleton-${i}`} />
              ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-center">
        {hasNextPage ? (
          <button
            className="btn btn-outline-primary"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? t('common.loading') : '더 보기'}
          </button>
        ) : (
          <span className="text-muted">{t('common.all_items_loaded')}</span>
        )}
      </div>

      {/* 자동 로딩 */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      <ScrollToTopButton />
    </div>
  );
};

export default ListForm;
