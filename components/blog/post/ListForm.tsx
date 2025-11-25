'use client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { useBlogPostInfinite } from '@/hooks/react-query/blog/usePost';
import ListRowSkeleton from './ListRowSkeleton';
import ListRow from './ListRow';
import type { IBlogPost, IBlogPostListRow } from '@/types/blog/post';
import ScrollToTopButton from '@/components/common/ScrollToTopButton';

import {
  DEFAULTS,
  isSameBaseParams,
  toSearchParamsFromBase,
  type BlogPostBaseParams,
} from '@/types/blog/post/search';
import SearchForm from './SearchForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquareCheck,
  faTrash,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'sonner';
import DeleteConfirmModal from './modal/DeleteConfirmModal';

type Props = { baseParams: BlogPostBaseParams };

const ListForm = ({ baseParams }: Props) => {
  const queryClient = useQueryClient();
  const { locale, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  // 1) URL → baseParams
  const [params, setParams] = useState<BlogPostBaseParams>(baseParams);
  const [, setForm] = useState<BlogPostBaseParams>(baseParams);

  const syncedOnceRef = useRef(false);
  useEffect(() => {
    if (!syncedOnceRef.current) {
      setParams(baseParams);
      setForm(baseParams);
      syncedOnceRef.current = true; // ✅ 최초 1회만 서버값 반영
    }
  }, [baseParams]);

  const applyParams = (next: BlogPostBaseParams) => {
    if (isSameBaseParams(next, params)) return;
    setParams(next);
    const qs = toSearchParamsFromBase(next);
    router.replace(`${pathname}?${qs.toString()}`);
  };

  const handleApply = (next: BlogPostBaseParams) => applyParams(next);
  const handleReset = () => applyParams(DEFAULTS);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useBlogPostInfinite(params);

  // 평탄화 + 중복 제거(커서 경계에서 같은 uid가 들어오는 상황 방지)
  const items: IBlogPostListRow[] = useMemo(() => {
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

  const [selectedRow, setSelectedRow] = useState<IBlogPost | null>(null);
  const [selectedUids, setSelectedUids] = useState<string[]>([]);

  const [checkAll, setCheckAll] = useState(false);
  const [modalType, setModalType] = useState<'single' | 'bulk'>('single');

  const handleCheck = (uid: string, checked: boolean) => {
    setSelectedUids((prev) =>
      checked ? [...prev, uid] : prev.filter((id) => id !== uid),
    );
  };

  const handleCheckAll = (checked: boolean) => {
    setCheckAll(checked);
    if (checked) {
      setSelectedUids(items.map((item) => item.uid));
    } else {
      setSelectedUids([]);
    }
  };

  const handleCreate = () => {
    const baseUrl = getRouteUrl('blogPost.create', locale);
    const qs = new URLSearchParams(baseParams as any).toString();

    const url = qs ? `${baseUrl}?${qs}` : baseUrl;
    router.push(url, { scroll: false });
  };

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
          {t('common.all')}: {totalAll} / {t('common.search')}: {totalFiltered}
        </div>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => refetch()}
        >
          {t('common.refresh')}
        </button>
      </div>

      <div className="col-12">
        <div className="row mb-3">
          <div className="col-12">
            <div className="row justify-content-between align-items-center">
              <div className="col-auto ">
                <div className="mailbox-controls">
                  <div className="btn-group">
                    <input
                      className="btn-check"
                      type="checkbox"
                      id="checkAll"
                      autoComplete="off"
                      onChange={(e) => handleCheckAll(e.target.checked)}
                    />
                    <label className="btn border-0  p-1" htmlFor="checkAll">
                      <FontAwesomeIcon
                        icon={checkAll ? faSquareCheck : faSquare}
                      />{' '}
                      {t('common.select_all')}
                    </label>
                  </div>

                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-default btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#confirmDeleteModal"
                      onClick={() => {
                        setSelectedRow(null);
                        setModalType('bulk');
                      }}
                      disabled={selectedUids.length === 0}
                    >
                      <FontAwesomeIcon icon={faTrash} />{' '}
                      {t('common.delete_selected')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th className="text-center">{t('columns.blogPost.uid')}</th>
              <th className="text-center">{t('columns.blogPost.userId')}</th>
              <th className="text-center">{t('columns.blogPost.content')}</th>
              <th className="text-center">{t('columns.blogPost.createdAt')}</th>
              <th className="text-center">{t('columns.blogPost.updatedAt')}</th>
              <th className="text-center">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              items.map((row: IBlogPostListRow) => (
                <ListRow
                  key={row.idx}
                  row={row}
                  setSelectedRow={setSelectedRow}
                  setModalType={setModalType}
                  isChecked={selectedUids.includes(row.uid)}
                  onCheck={handleCheck}
                />
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
            {isFetchingNextPage ? t('common.loading') : t('common.more')}
          </button>
        ) : (
          <span className="text-muted">{t('common.all_items_loaded')}</span>
        )}
      </div>

      {/* 자동 로딩 */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      <DeleteConfirmModal
        row={modalType === 'single' ? selectedRow : null}
        uids={modalType === 'bulk' ? selectedUids : []}
        onDeleted={(deletedUids) => {
          // 1. 먼저 캐시 직접 업데이트
          queryClient.setQueryData(['blogPost', params], (oldData: any) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                items: page.items.filter(
                  (item: any) => !deletedUids.includes(item.uid),
                ),
                totalAll: Math.max(0, page.totalAll - deletedUids.length),
                totalFiltered: Math.max(
                  0,
                  page.totalFiltered - deletedUids.length,
                ),
              })),
            };
          });
          // 2. 그 다음 백그라운드에서 데이터 다시 불러오기 (정확한 데이터 갱신)
          queryClient.invalidateQueries({ queryKey: ['blogPost', params] });

          setSelectedUids([]);
          setSelectedRow(null);
          setCheckAll(false);
          toast.success(t('common.delete_success'));
        }}
      />

      <ScrollToTopButton />

      <button
        type="button"
        onClick={handleCreate}
        className="btn btn-secondary rounded-circle shadow position-fixed"
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '30px',
          zIndex: 51,
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textDecoration: 'none',
        }}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  );
};

export default ListForm;
