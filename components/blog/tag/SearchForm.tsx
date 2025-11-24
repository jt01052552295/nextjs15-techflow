'use client';
import { useEffect, useState, useId } from 'react';
import { DEFAULTS, type BlogTagBaseParams } from '@/types/blog/tag/search';
import { useLanguage } from '@/components/context/LanguageContext';

type Props = {
  value: BlogTagBaseParams; // 현재 URL에서 온 값
  onApply: (next: BlogTagBaseParams) => void; // 확인/검색 버튼 클릭 시만 호출
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

  const uid = useId(); // SSR/CSR 모두 안전한 유니크 접두어
  const rn = (group: string) => `${uid}-${group}`; // radio name
  const rid = (id: string) => `${uid}-${id}`; // input id

  // 로컬 상태(입력값) — onChange는 여기만 반영하고, 최종은 버튼으로만 적용
  const [q, setQ] = useState(value.q ?? '');
  const [f, setF] = useState<BlogTagBaseParams>(value);

  // URL 값이 바뀌면 폼 동기화
  useEffect(() => {
    setQ(value.q ?? '');
    setF(value);
  }, [value]);

  // 기간 정규화(시작>종료면 자동 스왑)
  const normalizePeriod = (next: BlogTagBaseParams) => {
    const s = next.startDate,
      e = next.endDate;
    if (s && e && s > e) {
      return { ...next, startDate: e, endDate: s };
    }
    return next;
  };

  const apply = () => {
    const next = normalizePeriod({ ...f, q: q || undefined });
    onApply(next);
  };

  // ───────── 버튼 라벨 (항상 "적용값 value" 기준!) ─────────
  const dateBtnLabel = (() => {
    if (!value.dateType && !value.startDate && !value.endDate)
      return t('common.period');
    const type =
      value.dateType === 'createdAt'
        ? t('columns.blogTag.createdAt')
        : value.dateType === 'updatedAt'
          ? t('columns.blogTag.updatedAt')
          : t('common.period');
    const range =
      value.startDate || value.endDate
        ? ` ${value.startDate ?? '..'}~${value.endDate ?? '..'}`
        : '';
    return `${type}${range}`;
  })();

  const isUseBtnLabel =
    value.isUse === undefined
      ? t('columns.blogTag.isUse')
      : value.isUse
        ? t('common.usage')
        : t('common.usageNone');

  const isVisibleBtnLabel =
    value.isVisible === undefined
      ? t('columns.blogTag.isVisible')
      : value.isVisible
        ? t('common.visible')
        : t('common.visibleNone');

  const sortBtnLabel = (() => {
    const map: Record<string, string> = {
      createdAt: t('columns.blogTag.createdAt'),
      updatedAt: t('columns.blogTag.updatedAt'),
      idx: t('columns.blogTag.idx'),
      name: t('columns.blogTag.name'),
      code: t('columns.blogTag.code'),
    };
    const by =
      map[value.sortBy ?? DEFAULTS.sortBy!] ?? t('columns.blogTag.idx');
    const arrow = (value.order ?? DEFAULTS.order) === 'desc' ? '↓' : '↑';
    return `${by} ${arrow}`;
  })();

  const limitBtnLabel = `${value.limit ?? DEFAULTS.limit}`;

  // ───────── 각 부분필터 "초기화"(편집값만 리셋; 적용은 확인 버튼에서) ─────────
  const resetDate = () =>
    setF((prev) => ({
      ...prev,
      startDate: undefined,
      endDate: undefined,
    }));
  const resetUse = () => setF((prev) => ({ ...prev, isUse: undefined }));
  const resetVisible = () =>
    setF((prev) => ({ ...prev, isVisible: undefined }));
  const resetSort = () =>
    setF((prev) => ({
      ...prev,
      sortBy: DEFAULTS.sortBy,
      order: DEFAULTS.order,
    }));
  const resetLimit = () => setF((prev) => ({ ...prev, limit: DEFAULTS.limit }));

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
          </div>
        </div>

        {/* 모바일에서는 두번째 줄, 데스크탑에서는 옆에 표시되는 버튼들 */}
        <div className="col-12 col-md-6">
          <div className="d-flex flex-wrap gap-2 h-100 justify-content-md-end align-items-md-center">
            {/* 필터 버튼 - 항상 표시 */}
            <button
              className="btn btn-outline-primary"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#categoryFilters"
              aria-controls="categoryFilters"
            >
              {t('common.filter')}
            </button>

            {/* 초기화 버튼 - 항상 표시 */}
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={onReset}
              disabled={loading}
            >
              {t('common.reset')}
            </button>
          </div>
        </div>

        {/* 상세 필터 버튼들 - 모바일에서는 따로 표시 */}
        <div className="col-12">
          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-sm btn-outline-primary"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#of-date"
            >
              {dateBtnLabel}
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#of-isUse-single"
            >
              {isUseBtnLabel}
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#of-isVisible-single"
            >
              {isVisibleBtnLabel}
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#of-sort-single"
            >
              {sortBtnLabel}
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#of-limit-single"
            >
              {limitBtnLabel}
            </button>
          </div>
        </div>
      </div>
      <div className="d-flex gap-2 d-none" id="filter-groups">
        <div className="flex-grow-1">
          <input
            className="form-control"
            placeholder={t('common.search_all')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={apply}
          disabled={loading}
        >
          {t('common.search')}
        </button>

        <button
          className="btn btn-outline-primary"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#categoryFilters"
          aria-controls="categoryFilters"
        >
          {t('common.filter')}
        </button>
        {/* 각 항목별 Offcanvas 트리거 */}
        <button
          className="btn btn-outline-primary"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#of-date"
        >
          {dateBtnLabel}
        </button>
        <button
          className="btn btn-outline-primary"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#of-isUse-single"
        >
          {isUseBtnLabel}
        </button>
        <button
          className="btn btn-outline-primary"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#of-isVisible-single"
        >
          {isVisibleBtnLabel}
        </button>
        <button
          className="btn btn-outline-primary"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#of-sort-single"
        >
          {sortBtnLabel}
        </button>
        <button
          className="btn btn-outline-primary"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#of-limit-single"
        >
          {limitBtnLabel}
        </button>

        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={onReset}
          disabled={loading}
        >
          {t('common.reset')}
        </button>
      </div>

      {/* Offcanvas (모바일 친화 필터) */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="categoryFilters"
        aria-labelledby="categoryFiltersLabel"
      >
        <div className="offcanvas-header">
          <h5 id="categoryFiltersLabel" className="offcanvas-title">
            {t('common.filter')}
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>

        <div className="offcanvas-body">
          {/* 날짜 구분 */}
          <div className="mb-3">
            <label className="form-label">{t('common.period')}</label>
            <div className="btn-group" role="group">
              <input
                type="radio"
                className="btn-check"
                name={rn('dateType-all')}
                id={rid('dateType-all-created')}
                checked={f.dateType === 'createdAt'}
                onChange={() => setF({ ...f, dateType: 'createdAt' })}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor={rid('dateType-all-created')}
              >
                {t('columns.blogTag.createdAt')}
              </label>

              <input
                type="radio"
                className="btn-check"
                name={rn('dateType-all')}
                id={rid('dateType-all-updated')}
                checked={f.dateType === 'updatedAt'}
                onChange={() => setF({ ...f, dateType: 'updatedAt' })}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor={rid('dateType-all-updated')}
              >
                {t('columns.blogTag.updatedAt')}
              </label>
            </div>
          </div>

          {/* 기간 */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label">{t('common.start_date')}</label>
              <input
                type="date"
                className="form-control"
                value={f.startDate ?? ''}
                onChange={(e) =>
                  setF({ ...f, startDate: e.target.value || undefined })
                }
              />
            </div>
            <div className="col-6">
              <label className="form-label">{t('common.end_date')}</label>
              <input
                type="date"
                className="form-control"
                value={f.endDate ?? ''}
                onChange={(e) =>
                  setF({ ...f, endDate: e.target.value || undefined })
                }
              />
            </div>
          </div>

          {/* isUse */}
          <div className="mb-3">
            <label className="form-label">{t('columns.blogTag.isUse')}</label>
            <div className="btn-group" role="group">
              <input
                type="radio"
                className="btn-check"
                name={rn('isUse-all')}
                id={rid('isUse-all-any')}
                checked={f.isUse === undefined}
                onChange={() => setF({ ...f, isUse: undefined })}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor={rid('isUse-all-any')}
              >
                {t('common.all')}
              </label>

              <input
                type="radio"
                className="btn-check"
                name={rn('isUse-all')}
                id={rid('isUse-all-true')}
                checked={f.isUse === true}
                onChange={() => setF({ ...f, isUse: true })}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor={rid('isUse-all-true')}
              >
                {t('common.usage')}
              </label>

              <input
                type="radio"
                className="btn-check"
                name={rn('isUse-all')}
                id={rid('isUse-all-false')}
                checked={f.isUse === false}
                onChange={() => setF({ ...f, isUse: false })}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor={rid('isUse-all-false')}
              >
                {t('common.usageNone')}
              </label>
            </div>
          </div>

          {/* isVisible */}
          <div className="mb-3">
            <label className="form-label">
              {t('columns.blogTag.isVisible')}
            </label>
            <div className="btn-group" role="group">
              <input
                type="radio"
                className="btn-check"
                name={rn('isVisible-all')}
                id={rid('isVisible-all-any')}
                checked={f.isVisible === undefined}
                onChange={() => setF({ ...f, isVisible: undefined })}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor={rid('isVisible-all-any')}
              >
                {t('common.all')}
              </label>

              <input
                type="radio"
                className="btn-check"
                name={rn('isVisible-all')}
                id={rid('isVisible-all-true')}
                checked={f.isVisible === true}
                onChange={() => setF({ ...f, isVisible: true })}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor={rid('isVisible-all-true')}
              >
                {t('common.visible')}
              </label>

              <input
                type="radio"
                className="btn-check"
                name={rn('isVisible-all')}
                id={rid('isVisible-all-false')}
                checked={f.isVisible === false}
                onChange={() => setF({ ...f, isVisible: false })}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor={rid('isVisible-all-false')}
              >
                {t('common.visibleNone')}
              </label>
            </div>
          </div>

          {/* 정렬 */}
          <div className="mb-3">
            <label className="form-label">{t('common.sort')}</label>
            <div className="row row-cols-2 g-2">
              <div className="col">
                <select
                  className="form-select"
                  value={f.sortBy ?? 'idx'}
                  onChange={(e) =>
                    setF({ ...f, sortBy: e.target.value as any })
                  }
                >
                  <option value="createdAt">
                    {t('columns.blogTag.createdAt')}
                  </option>
                  <option value="updatedAt">
                    {t('columns.blogTag.updatedAt')}
                  </option>
                  <option value="idx">{t('columns.blogTag.idx')}</option>
                  <option value="name">{t('columns.blogTag.name')}</option>
                  <option value="code">{t('columns.blogTag.code')}</option>
                </select>
              </div>
              <div className="col">
                <div className="btn-group w-100">
                  <input
                    type="radio"
                    className="btn-check"
                    name={rn('order-all')}
                    id={rid(`order-all-desc`)}
                    checked={(f.order ?? 'desc') === 'desc'}
                    onChange={() => setF({ ...f, order: 'desc' })}
                  />
                  <label
                    className="btn btn-outline-secondary"
                    htmlFor={rid(`order-all-desc`)}
                  >
                    {t('common.desc')}
                  </label>
                  <input
                    type="radio"
                    className="btn-check"
                    name={rn('order-all')}
                    id={rid(`order-all-asc`)}
                    checked={f.order === 'asc'}
                    onChange={() => setF({ ...f, order: 'asc' })}
                  />
                  <label
                    className="btn btn-outline-secondary"
                    htmlFor={rid(`order-all-asc`)}
                  >
                    {t('common.asc')}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* limit */}
          <div className="mb-3">
            <label className="form-label">{t('common.limit')}</label>
            <div className="btn-group" role="group">
              {[10, 20, 50, 100].map((n) => (
                <div key={n}>
                  <input
                    type="radio"
                    className="btn-check"
                    name={rn('limit-all')}
                    id={rid(`limit-all-${n}`)}
                    checked={(f.limit ?? 20) === n}
                    onChange={() => setF({ ...f, limit: n })}
                  />
                  <label
                    className="btn btn-outline-secondary"
                    htmlFor={rid(`limit-all-${n}`)}
                  >
                    {n}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="d-grid">
            <button
              className="btn btn-primary"
              type="button"
              data-bs-dismiss="offcanvas"
              onClick={apply}
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>

      {/* ─────────── 기간(통합) Offcanvas ─────────── */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="of-date"
        aria-labelledby="of-date-label"
      >
        <div className="offcanvas-header">
          <h5 id="of-date-label" className="offcanvas-title">
            {t('common.period')}
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body">
          {/* 날짜 구분 */}
          <div className="mb-3">
            <label className="form-label">{t('common.period')}</label>
            <div className="btn-group" role="group">
              <input
                type="radio"
                className="btn-check"
                name={rn('dateType-single')}
                id={rid('dateType-single-created')}
                checked={f.dateType === 'createdAt'}
                onChange={() => setF({ ...f, dateType: 'createdAt' })}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor={rid('dateType-single-created')}
              >
                {t('columns.blogTag.createdAt')}
              </label>

              <input
                type="radio"
                className="btn-check"
                name={rn('dateType-single')}
                id={rid('dateType-single-updated')}
                checked={f.dateType === 'updatedAt'}
                onChange={() => setF({ ...f, dateType: 'updatedAt' })}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor={rid('dateType-single-updated')}
              >
                {t('columns.blogTag.updatedAt')}
              </label>
            </div>
          </div>

          {/* 기간 */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label">{t('common.start_date')}</label>
              <input
                type="date"
                className="form-control"
                value={f.startDate ?? ''}
                onChange={(e) =>
                  setF({ ...f, startDate: e.target.value || undefined })
                }
              />
            </div>
            <div className="col-6">
              <label className="form-label">{t('common.end_date')}</label>
              <input
                type="date"
                className="form-control"
                value={f.endDate ?? ''}
                onChange={(e) =>
                  setF({ ...f, endDate: e.target.value || undefined })
                }
              />
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={resetDate}
            >
              {t('common.reset')}
            </button>
            <button
              className="btn btn-primary ms-auto"
              type="button"
              data-bs-dismiss="offcanvas"
              onClick={apply}
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────── Offcanvas: 사용 ───────────────── */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="of-isUse-single"
        aria-labelledby="of-isUse-single-label"
      >
        <div className="offcanvas-header">
          <h5 id="of-isUse-single-label" className="offcanvas-title">
            {t('columns.blogTag.isUse')}
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body">
          <div className="btn-group" role="group">
            <input
              type="radio"
              className="btn-check"
              name={rn('isUse-single')}
              id={rid('isUse-single-any')}
              checked={f.isUse === undefined}
              onChange={() => setF({ ...f, isUse: undefined })}
            />
            <label
              className="btn btn-outline-secondary"
              htmlFor={rid('isUse-single-any')}
            >
              {t('common.all')}
            </label>

            <input
              type="radio"
              className="btn-check"
              name={rn('isUse-single')}
              id={rid('isUse-single-true')}
              checked={f.isUse === true}
              onChange={() => setF({ ...f, isUse: true })}
            />
            <label
              className="btn btn-outline-secondary"
              htmlFor={rid('isUse-single-true')}
            >
              {t('common.usage')}
            </label>

            <input
              type="radio"
              className="btn-check"
              name={rn('isUse-single')}
              id={rid('isUse-single-false')}
              checked={f.isUse === false}
              onChange={() => setF({ ...f, isUse: false })}
            />
            <label
              className="btn btn-outline-secondary"
              htmlFor={rid('isUse-single-false')}
            >
              {t('common.usageNone')}
            </label>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={resetUse}
            >
              {t('common.reset')}
            </button>
            <button
              className="btn btn-primary ms-auto"
              type="button"
              data-bs-dismiss="offcanvas"
              onClick={apply}
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────── Offcanvas: 노출 ───────────────── */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="of-isVisible-single"
        aria-labelledby="of-isVisible-single-label"
      >
        <div className="offcanvas-header">
          <h5 id="of-isVisible-single-label" className="offcanvas-title">
            {t('columns.blogTag.isVisible')}
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body">
          <div className="btn-group" role="group">
            <input
              type="radio"
              className="btn-check"
              name={rn('isVisible-single')}
              id={rid('isVisible-single-any')}
              checked={f.isVisible === undefined}
              onChange={() => setF({ ...f, isVisible: undefined })}
            />
            <label
              className="btn btn-outline-secondary"
              htmlFor={rid('isVisible-single-any')}
            >
              {t('common.all')}
            </label>

            <input
              type="radio"
              className="btn-check"
              name={rn('isVisible-single')}
              id={rid('isVisible-single-true')}
              checked={f.isVisible === true}
              onChange={() => setF({ ...f, isVisible: true })}
            />
            <label
              className="btn btn-outline-secondary"
              htmlFor={rid('isVisible-single-true')}
            >
              {t('common.visible')}
            </label>

            <input
              type="radio"
              className="btn-check"
              name={rn('isVisible-single')}
              id={rid('isVisible-single-false')}
              checked={f.isVisible === false}
              onChange={() => setF({ ...f, isVisible: false })}
            />
            <label
              className="btn btn-outline-secondary"
              htmlFor={rid('isVisible-single-false')}
            >
              {t('common.visibleNone')}
            </label>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={resetVisible}
            >
              {t('common.reset')}
            </button>
            <button
              className="btn btn-primary ms-auto"
              type="button"
              data-bs-dismiss="offcanvas"
              onClick={apply}
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────── Offcanvas: 정렬 ───────────────── */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="of-sort-single"
        aria-labelledby="of-sort-single-label"
      >
        <div className="offcanvas-header">
          <h5 id="of-sort-single-label" className="offcanvas-title">
            {t('common.sort')}
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body">
          <div className="row row-cols-2 g-2">
            <div className="col">
              <select
                className="form-select"
                value={f.sortBy ?? 'idx'}
                onChange={(e) => setF({ ...f, sortBy: e.target.value as any })}
              >
                <option value="createdAt">
                  {t('columns.blogTag.createdAt')}
                </option>
                <option value="updatedAt">
                  {t('columns.blogTag.updatedAt')}
                </option>
                <option value="idx">{t('columns.blogTag.idx')}</option>
                <option value="name">{t('columns.blogTag.name')}</option>
                <option value="code">{t('columns.blogTag.code')}</option>
              </select>
            </div>
            <div className="col">
              <div className="btn-group w-100">
                <input
                  type="radio"
                  className="btn-check"
                  name={rn('order-single')}
                  id={rid('order-single-desc')}
                  checked={(f.order ?? 'desc') === 'desc'}
                  onChange={() => setF({ ...f, order: 'desc' })}
                />
                <label
                  className="btn btn-outline-secondary"
                  htmlFor={rid('order-single-desc')}
                >
                  {t('common.desc')}
                </label>
                <input
                  type="radio"
                  className="btn-check"
                  name={rn('order-single')}
                  id={rid('order-single-asc')}
                  checked={f.order === 'asc'}
                  onChange={() => setF({ ...f, order: 'asc' })}
                />
                <label
                  className="btn btn-outline-secondary"
                  htmlFor={rid('order-single-asc')}
                >
                  {t('common.asc')}
                </label>
              </div>
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={resetSort}
            >
              {t('common.reset')}
            </button>
            <button
              className="btn btn-primary ms-auto"
              type="button"
              data-bs-dismiss="offcanvas"
              onClick={apply}
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
      {/* ───────────────── Offcanvas: 페이지 크기 ───────────────── */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="of-limit-single"
        aria-labelledby="of-limit-single-label"
      >
        <div className="offcanvas-header">
          <h5 id="of-limit-single-label" className="offcanvas-title">
            {t('common.limit')}
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body">
          <div className="btn-group" role="group">
            {[10, 20, 50, 100].map((n) => (
              <div key={n}>
                <input
                  type="radio"
                  className="btn-check"
                  name={rn('limit-single')}
                  id={rid(`limit-single-${n}`)}
                  checked={(f.limit ?? 20) === n}
                  onChange={() => setF({ ...f, limit: n })}
                />
                <label
                  className="btn btn-outline-secondary"
                  htmlFor={rid(`limit-single-${n}`)}
                >
                  {n}
                </label>
              </div>
            ))}
          </div>

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={resetLimit}
            >
              {t('common.reset')}
            </button>
            <button
              className="btn btn-primary ms-auto"
              type="button"
              data-bs-dismiss="offcanvas"
              onClick={apply}
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
