'use client';
import { useEffect, useState, useId } from 'react';
import { DEFAULTS, type PracticeBaseParams } from '@/types/practice/search';

type Props = {
  value: PracticeBaseParams; // 현재 URL에서 온 값
  onApply: (next: PracticeBaseParams) => void; // 확인/검색 버튼 클릭 시만 호출
  onReset: () => void; // 초기화
  loading?: boolean;
};

export default function SearchForm({
  value,
  onApply,
  onReset,
  loading,
}: Props) {
  const uid = useId(); // SSR/CSR 모두 안전한 유니크 접두어
  const rn = (group: string) => `${uid}-${group}`; // radio name
  const rid = (id: string) => `${uid}-${id}`; // input id

  // 로컬 상태(입력값) — onChange는 여기만 반영하고, 최종은 버튼으로만 적용
  const [q, setQ] = useState(value.q ?? '');
  const [f, setF] = useState<PracticeBaseParams>(value);

  // URL 값이 바뀌면 폼 동기화
  useEffect(() => {
    setQ(value.q ?? '');
    setF(value);
  }, [value]);

  // 기간 정규화(시작>종료면 자동 스왑)
  const normalizePeriod = (next: PracticeBaseParams) => {
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
      return '날짜·기간';
    const type =
      value.dateType === 'createdAt'
        ? '작성일'
        : value.dateType === 'updatedAt'
          ? '수정일'
          : '날짜';
    const range =
      value.startDate || value.endDate
        ? ` ${value.startDate ?? '..'}~${value.endDate ?? '..'}`
        : '';
    return `${type}${range}`;
  })();

  const isUseBtnLabel =
    value.isUse === undefined ? '사용' : value.isUse ? '사용(ON)' : '미사용';

  const isVisibleBtnLabel =
    value.isVisible === undefined
      ? '노출'
      : value.isVisible
        ? '노출(ON)'
        : '비노출';

  const sortBtnLabel = (() => {
    const map: Record<string, string> = {
      createdAt: '작성일',
      updatedAt: '수정일',
      idx: 'IDX',
      name: '이름',
      email: '이메일',
      sortOrder: '정렬값',
    };
    const by = map[value.sortBy ?? DEFAULTS.sortBy!] ?? '정렬값';
    const arrow = (value.order ?? DEFAULTS.order) === 'desc' ? '↓' : '↑';
    return `${by} ${arrow}`;
  })();

  const limitBtnLabel = `${value.limit ?? DEFAULTS.limit}개`;

  // ───────── 각 부분필터 "초기화"(편집값만 리셋; 적용은 확인 버튼에서) ─────────
  const resetDate = () =>
    setF((prev) => ({
      ...prev,
      dateType: undefined,
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
      <div className="d-flex gap-2">
        <div className="flex-grow-1">
          <input
            className="form-control"
            placeholder="이름/이메일 통합검색"
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
          검색
        </button>

        <button
          className="btn btn-outline-primary"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#practiceFilters"
          aria-controls="practiceFilters"
        >
          필터
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
          초기화
        </button>
      </div>

      {/* Offcanvas (모바일 친화 필터) */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="practiceFilters"
        aria-labelledby="practiceFiltersLabel"
      >
        <div className="offcanvas-header">
          <h5 id="practiceFiltersLabel" className="offcanvas-title">
            필터
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
            <label className="form-label">날짜 구분</label>
            <div className="btn-group" role="group">
              <input
                type="radio"
                className="btn-check"
                name={rn('dateType-all')}
                id={rid('dateType-all-any')}
                checked={!f.dateType}
                onChange={() => setF({ ...f, dateType: undefined })}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor={rid('dateType-all-any')}
              >
                전체
              </label>

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
                작성일
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
                수정일
              </label>
            </div>
          </div>

          {/* 기간 */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label">시작일</label>
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
              <label className="form-label">종료일</label>
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
            <label className="form-label">사용 여부</label>
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
                전체
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
                사용
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
                미사용
              </label>
            </div>
          </div>

          {/* isVisible */}
          <div className="mb-3">
            <label className="form-label">노출 여부</label>
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
                전체
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
                노출
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
                비노출
              </label>
            </div>
          </div>

          {/* 정렬 */}
          <div className="mb-3">
            <label className="form-label">정렬</label>
            <div className="row row-cols-2 g-2">
              <div className="col">
                <select
                  className="form-select"
                  value={f.sortBy ?? 'sortOrder'}
                  onChange={(e) =>
                    setF({ ...f, sortBy: e.target.value as any })
                  }
                >
                  <option value="createdAt">작성일</option>
                  <option value="updatedAt">수정일</option>
                  <option value="idx">IDX</option>
                  <option value="name">이름</option>
                  <option value="email">이메일</option>
                  <option value="sortOrder">정렬값</option>
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
                    내림차순
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
                    오름차순
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* limit */}
          <div className="mb-3">
            <label className="form-label">페이지 크기</label>
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
                    {n}개
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
              확인
            </button>
          </div>
        </div>
      </div>

      {/* ─────────── 날짜·기간(통합) Offcanvas ─────────── */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="of-date"
        aria-labelledby="of-date-label"
      >
        <div className="offcanvas-header">
          <h5 id="of-date-label" className="offcanvas-title">
            날짜·기간
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
            <label className="form-label">날짜 구분</label>
            <div className="btn-group" role="group">
              <input
                type="radio"
                className="btn-check"
                name={rn('dateType-single')}
                id={rid('dateType-single-true')}
                checked={!f.dateType}
                onChange={() => setF({ ...f, dateType: undefined })}
              />
              <label
                className="btn btn-outline-secondary"
                htmlFor={rid('dateType-single-true')}
              >
                전체
              </label>

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
                작성일
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
                수정일
              </label>
            </div>
          </div>

          {/* 기간 */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label">시작일</label>
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
              <label className="form-label">종료일</label>
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
              초기화
            </button>
            <button
              className="btn btn-primary ms-auto"
              type="button"
              data-bs-dismiss="offcanvas"
              onClick={apply}
            >
              확인
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
            사용 여부
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
              전체
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
              사용
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
              미사용
            </label>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={resetUse}
            >
              초기화
            </button>
            <button
              className="btn btn-primary ms-auto"
              type="button"
              data-bs-dismiss="offcanvas"
              onClick={apply}
            >
              확인
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
            노출 여부
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
              전체
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
              노출
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
              비노출
            </label>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={resetVisible}
            >
              초기화
            </button>
            <button
              className="btn btn-primary ms-auto"
              type="button"
              data-bs-dismiss="offcanvas"
              onClick={apply}
            >
              확인
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
            정렬
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
                value={f.sortBy ?? 'sortOrder'}
                onChange={(e) => setF({ ...f, sortBy: e.target.value as any })}
              >
                <option value="createdAt">작성일</option>
                <option value="updatedAt">수정일</option>
                <option value="idx">IDX</option>
                <option value="name">이름</option>
                <option value="email">이메일</option>
                <option value="sortOrder">정렬값</option>
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
                  내림차순
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
                  오름차순
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
              초기화
            </button>
            <button
              className="btn btn-primary ms-auto"
              type="button"
              data-bs-dismiss="offcanvas"
              onClick={apply}
            >
              확인
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
            페이지 크기
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
                  {n}개
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
              초기화
            </button>
            <button
              className="btn btn-primary ms-auto"
              type="button"
              data-bs-dismiss="offcanvas"
              onClick={apply}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
