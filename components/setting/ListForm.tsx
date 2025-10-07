'use client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';
import { useSettingInfinite } from '@/hooks/react-query/useSetting';
import ListRowSkeleton from './ListRowSkeleton';
import ListRow from './ListRow';
import type { ISetting, ListEditCell } from '@/types/setting';
import ScrollToTopButton from '../common/ScrollToTopButton';

import {
  DEFAULTS,
  isSameBaseParams,
  toSearchParamsFromBase,
  type SettingBaseParams,
} from '@/types/setting/search';
import SearchForm from './SearchForm';
import { listUpdateAction } from '@/actions/setting/list/update';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquareCheck,
  faTrash,
  faArrowUpWideShort,
  faArrowUp,
  faArrowDown,
  faArrowDownWideShort,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'sonner';

type Props = { baseParams: SettingBaseParams };

const ListForm = ({ baseParams }: Props) => {
  const queryClient = useQueryClient();
  const { locale, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  // 1) URL → baseParams
  const [params, setParams] = useState<SettingBaseParams>(baseParams);
  const [, setForm] = useState<SettingBaseParams>(baseParams);

  const syncedOnceRef = useRef(false);
  useEffect(() => {
    if (!syncedOnceRef.current) {
      setParams(baseParams);
      setForm(baseParams);
      syncedOnceRef.current = true; // ✅ 최초 1회만 서버값 반영
    }
  }, [baseParams]);

  const applyParams = (next: SettingBaseParams) => {
    if (isSameBaseParams(next, params)) return;
    setParams(next);
    const qs = toSearchParamsFromBase(next);
    router.replace(`${pathname}?${qs.toString()}`);
  };

  const handleApply = (next: SettingBaseParams) => applyParams(next);
  const handleReset = () => applyParams(DEFAULTS);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useSettingInfinite(params);

  // 평탄화 + 중복 제거(커서 경계에서 같은 uid가 들어오는 상황 방지)
  const items: ISetting[] = useMemo(() => {
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

  const [selectedRow, setSelectedRow] = useState<ISetting | null>(null);
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const isSingleSelected = selectedUids.length === 1;
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

  const handleFieldSave = async (
    uid: string,
    field: ListEditCell,
    newValue: string,
    onSuccess: (val: string) => void,
    onError: () => void,
  ) => {
    const res = await listUpdateAction({ uid, [field]: newValue });

    if (res.status === 'success') {
      queryClient.invalidateQueries({ queryKey: ['setting', params] });
      toast.success(res.message);
      onSuccess(newValue);
    } else {
      toast.error(res.message);
      onError();
    }
  };

  const handleCreate = () => {
    const baseUrl = getRouteUrl('setting.create', locale);
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

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th className="text-center">{t('columns.setting.uid')}</th>
              <th className="text-center">{t('columns.setting.userId')}</th>
              <th className="text-center">{t('columns.setting.gubun')}</th>
              <th className="text-center">
                {t('columns.setting.kepcoContract')}
              </th>
              <th className="text-center">{t('columns.setting.pushPoint')}</th>
              <th className="text-center">{t('columns.setting.pushBill')}</th>
              <th className="text-center">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              items.map((row: ISetting) => (
                <ListRow
                  key={row.idx}
                  row={row}
                  setSelectedRow={setSelectedRow}
                  isChecked={selectedUids.includes(row.uid)}
                  onCheck={handleCheck}
                  onFieldSave={handleFieldSave}
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
