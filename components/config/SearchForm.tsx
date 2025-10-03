'use client';
import { useEffect, useState } from 'react';
import { type ConfigBaseParams } from '@/types/config/search';
import { useLanguage } from '@/components/context/LanguageContext';

type Props = {
  value: ConfigBaseParams; // 현재 URL에서 온 값
  onApply: (next: ConfigBaseParams) => void; // 확인/검색 버튼 클릭 시만 호출
  onReset: () => void; // 초기화
  loading?: boolean;
};

export default function SearchForm({
  value,
  onApply,
  onReset,
  loading,
}: Props) {
  const { t } = useLanguage();

  // 로컬 상태(입력값) — onChange는 여기만 반영하고, 최종은 버튼으로만 적용
  const [q, setQ] = useState(value.q ?? '');
  const [f, setF] = useState<ConfigBaseParams>(value);

  // URL 값이 바뀌면 폼 동기화
  useEffect(() => {
    setQ(value.q ?? '');
    setF(value);
  }, [value]);

  // 기간 정규화(시작>종료면 자동 스왑)
  const normalizePeriod = (next: ConfigBaseParams) => {
    return next;
  };

  const apply = () => {
    const next = normalizePeriod({ ...f, q: q || undefined });
    onApply(next);
  };

  const reset = () => {
    onReset();
  };

  return (
    <div className="mb-3">
      <div className="row g-2 mb-2" id="filter-groups">
        {/* 검색창과 검색 버튼 - 모든 화면 크기에서 우선 표시 */}
        <div className="col-12 col-md-6">
          <div className="input-group">
            <input
              className="form-control"
              placeholder={t('common.search_all')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={apply}
              disabled={loading}
            >
              {t('common.search')}
            </button>
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={reset}
              disabled={loading}
            >
              {t('common.reset')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
