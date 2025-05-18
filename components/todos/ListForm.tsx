'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useListMemory } from '@/hooks/useListMemory';
import { useInView } from 'react-intersection-observer';
import type { ITodos, ITodosFilterType, OrderField } from '@/types/todos';
import { listAction } from '@/actions/todos/list';
import SearchForm from './SearchForm';
import ListRow from './ListRow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretUp,
  faCaretDown,
  faSquareCheck,
  faTrash,
  faArrowUpWideShort,
  faArrowUp,
  faArrowDown,
  faArrowDownWideShort,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import ScrollToTopButton from '../common/ScrollToTopButton';
import DeleteConfirmModal from './modal/DeleteConfirmModal';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'sonner';
import { listUpdateAction } from '@/actions/todos/list/update';
import { listSortAction } from '@/actions/todos/list/sort';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import ListRowSkeleton from './ListRowSkeleton';

const ListForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useLanguage();

  const pathname = 'todos';
  const listMemory = useListMemory(pathname);

  const [items, setItems] = useState<ITodos[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const didRestoreScroll = useRef(false);
  const { ref: loaderRef, inView } = useInView({ threshold: 0 });

  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState<ITodosFilterType | null>(null);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<keyof ITodos | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [selectedTodo, setSelectedTodo] = useState<ITodos | null>(null);
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const isSingleSelected = selectedUids.length === 1;
  const [checkAll, setCheckAll] = useState(false);
  const [modalType, setModalType] = useState<'single' | 'bulk'>('single');

  const fetchMore = useCallback(
    async (reset = false, overrideFilters?: ITodosFilterType) => {
      if (loading) return;
      setLoading(true);

      const nextPage = reset ? 1 : page;
      const effectiveFilters = overrideFilters ?? filters;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const data = await listAction(nextPage, effectiveFilters ?? undefined);

      if (data) {
        setItems((prev) => {
          const combined = reset ? data.items : [...prev, ...data.items];
          const deduped = combined.filter(
            (item, idx, self) =>
              self.findIndex((i) => i.idx === item.idx) === idx,
          );
          return deduped;
        });
        setPage((prev) => (reset ? 2 : prev + 1));
        setHasMore(data.hasMore);
        setTotalCount(data.totalCount);
      }

      setLoading(false);
    },
    [loading, page, filters],
  );

  useEffect(() => {
    const restored = listMemory.restore();
    if (restored.items.length > 0) {
      setItems(restored.items);
      setPage(restored.page);
      setFilters(restored.filters);
      setHasMore(true);
      return;
    }

    const initialFilters: ITodosFilterType = {
      name: searchParams.get('name') || '',
      email: searchParams.get('email') || '',
      orderBy: (searchParams.get('orderBy') as OrderField) || 'sortOrder',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
      dateType: searchParams.get('dateType') || '',
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
    };
    setFilters(initialFilters);
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  useEffect(() => {
    if (!filters) return;
    if (listMemory.restore().items.length > 0) {
      listMemory.clear();
      return;
    }
    fetchMore(true, filters);
  }, [filters]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchMore();
    }
  }, [inView, hasMore, loading, fetchMore]);

  useEffect(() => {
    const { scrollY } = listMemory.restore();
    if (scrollY && !didRestoreScroll.current) {
      const interval = setInterval(() => {
        const ready = document.querySelector('tbody tr');
        if (ready) {
          window.scrollTo(0, scrollY);
          clearInterval(interval);
          listMemory.clear();
          didRestoreScroll.current = true;
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const handleSort = (field: OrderField, direction: 'asc' | 'desc') => {
    const updatedFilters: ITodosFilterType = {
      name: filters?.name,
      email: filters?.email ?? '', // ✅ 필수 string 보장
      dateType: filters?.dateType,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      orderBy: field,
      order: direction,
    };
    const params = new URLSearchParams({
      ...updatedFilters,
      page: '1',
    } as Record<string, string>);

    router.push(`?${params.toString()}`);
    setItems([]);
    setPage(1);
    setHasMore(true);
    setFilters(updatedFilters);

    setSortField(field);
    setSortOrder(direction);
  };

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

  const handleFieldSave = async (
    uid: string,
    field: 'name' | 'email',
    newValue: string,
    onSuccess: (val: string) => void,
    onError: () => void,
  ) => {
    const res = await listUpdateAction({ uid, [field]: newValue });

    if (res.status === 'success') {
      toast.success(res.message);
      setItems((prev) =>
        prev.map((item) =>
          item.uid === uid ? { ...item, [field]: newValue } : item,
        ),
      );
      onSuccess(newValue);
    } else {
      toast.error(res.message);
      onError();
    }
  };

  const handleMove = async (direction: 'up' | 'down' | 'top' | 'bottom') => {
    if (selectedUids.length !== 1) {
      toast.warning(t('common.sort_single_only'));
      return;
    }

    const selectedUid = selectedUids[0];
    const res = await listSortAction(selectedUid, direction);
    // console.log(res);
    if (res.status === 'success') {
      toast.success(res.message);
      fetchMore(true, undefined);
    } else {
      toast.error(res.message);
    }
  };

  const handleCreate = () => {
    listMemory.save({
      scrollY: window.scrollY,
      page,
      filters,
      items,
    });
    const url = `${getRouteUrl('todos.create', locale)}?${searchParams.toString()}`;
    router.push(url);
  };

  return (
    <div style={{ position: 'relative' }}>
      <SearchForm
        onSearch={(f) => {
          const params = new URLSearchParams({
            name: f.name ?? '',
            email: f.email ?? '',
            orderBy: f.orderBy ?? 'sortOrder',
            order: f.order ?? 'desc',
            dateType: f.dateType ?? '', // ✅ 추가
            startDate: f.startDate ?? '', // ✅ 추가
            endDate: f.endDate ?? '', // ✅ 추가
            page: '1', // 검색하면 항상 1페이지부터
          });
          router.push(`?${params.toString()}`);
          setItems([]);
          setPage(1);
          setHasMore(true);
          setFilters(f);
          fetchMore(true, f);
        }}
        totalCount={totalCount}
      />

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
                        setSelectedTodo(null);
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
              <div className="col-auto">
                <button
                  type="button"
                  className="btn border-0  p-1"
                  onClick={() => handleMove('top')}
                  disabled={!isSingleSelected}
                >
                  <FontAwesomeIcon
                    icon={faArrowUpWideShort}
                    title={t('common.move_top')}
                  />
                </button>
                <button
                  type="button"
                  className="btn border-0  p-1"
                  onClick={() => handleMove('up')}
                  disabled={!isSingleSelected}
                >
                  <FontAwesomeIcon
                    icon={faArrowUp}
                    title={t('common.move_up')}
                  />
                </button>
                <button
                  type="button"
                  className="btn border-0  p-1"
                  onClick={() => handleMove('down')}
                  disabled={!isSingleSelected}
                >
                  <FontAwesomeIcon
                    icon={faArrowDown}
                    title={t('common.move_down')}
                  />
                </button>
                <button
                  type="button"
                  className="btn border-0  p-1"
                  onClick={() => handleMove('bottom')}
                  disabled={!isSingleSelected}
                >
                  <FontAwesomeIcon
                    icon={faArrowDownWideShort}
                    title={t('common.move_bottom')}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th className="text-center">{t('columns.todos.uid')}</th>
              <th className="text-center">
                {t('columns.todos.name')}
                <span className="ms-2">
                  <FontAwesomeIcon
                    icon={faCaretUp}
                    onClick={() => handleSort('name', 'asc')}
                    className={`me-1 ${sortField === 'name' && sortOrder === 'asc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    onClick={() => handleSort('name', 'desc')}
                    className={`${sortField === 'name' && sortOrder === 'desc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                </span>
              </th>
              <th className="text-center">
                {t('columns.todos.email')}
                <span className="ms-2">
                  <FontAwesomeIcon
                    icon={faCaretUp}
                    onClick={() => handleSort('email', 'asc')}
                    className={`me-1 ${sortField === 'email' && sortOrder === 'asc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    onClick={() => handleSort('email', 'desc')}
                    className={`${sortField === 'email' && sortOrder === 'desc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                </span>
              </th>
              <th className="text-center">
                {t('columns.todos.createdAt')}
                <span className="ms-2">
                  <FontAwesomeIcon
                    icon={faCaretUp}
                    onClick={() => handleSort('createdAt', 'asc')}
                    className={`me-1 ${sortField === 'createdAt' && sortOrder === 'asc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    onClick={() => handleSort('createdAt', 'desc')}
                    className={`${sortField === 'createdAt' && sortOrder === 'desc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                </span>
              </th>
              <th className="text-center">
                {t('columns.todos.updatedAt')}
                <span className="ms-2">
                  <FontAwesomeIcon
                    icon={faCaretUp}
                    onClick={() => handleSort('updatedAt', 'asc')}
                    className={`me-1 ${sortField === 'updatedAt' && sortOrder === 'asc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    onClick={() => handleSort('updatedAt', 'desc')}
                    className={`${sortField === 'updatedAt' && sortOrder === 'desc' ? 'text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                  />
                </span>
              </th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <ListRow
                key={row.idx}
                row={row}
                setSelectedTodo={setSelectedTodo}
                isChecked={selectedUids.includes(row.uid)}
                onCheck={handleCheck}
                onFieldSave={handleFieldSave}
                items={items}
                page={page}
                filters={filters}
              />
            ))}
            {loading &&
              [...Array(3)].map((_, i) => (
                <ListRowSkeleton key={`skeleton-${i}`} />
              ))}
          </tbody>
        </table>
        {loading && <p className="text-center py-3">{t('common.loading')}</p>}

        <div ref={loaderRef} className="h-10" />
        {!hasMore && (
          <p className="text-center py-3">{t('common.all_items_loaded')}</p>
        )}
      </div>

      <DeleteConfirmModal
        row={modalType === 'single' ? selectedTodo : null}
        uids={modalType === 'bulk' ? selectedUids : []}
        onDeleted={(deletedUids) => {
          setItems((prev) =>
            prev.filter((item) => !deletedUids.includes(item.uid)),
          );
          setSelectedUids([]);
          setSelectedTodo(null);
          setCheckAll(false);
          toast.success(t('common.delete_success'));
          // location.reload();
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
