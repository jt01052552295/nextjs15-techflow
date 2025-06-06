'use client';

import React, { useState, useEffect } from 'react';
import type { ITodosFilterType, OrderField } from '@/types/todos';
import { getRouteUrl } from '@/utils/routes';
import { useLanguage } from '@/components/context/LanguageContext';
import { useSearchParams } from 'next/navigation';
type Props = {
  onSearch: (filters: ITodosFilterType) => void;
  totalCount?: number;
};

const SearchForm = ({ onSearch, totalCount }: Props) => {
  const { locale, t } = useLanguage();
  const searchParams = useSearchParams();
  const url = getRouteUrl('todos.index', locale);

  const [form, setForm] = useState<ITodosFilterType>({
    name: '',
    email: '',
    orderBy: 'sortOrder',
    order: 'desc',
    dateType: undefined,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    setForm({
      name: searchParams.get('name') || '',
      email: searchParams.get('email') || '',
      orderBy: (searchParams.get('orderBy') as OrderField) || 'sortOrder',
      order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
      dateType: searchParams.get('dateType') || undefined,
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
    });
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(form);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="row g-2 align-items-end mb-3">
        <div className="col-md-2">
          <label className="form-label">{t('columns.todos.name')}</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-2">
          <label className="form-label">
            {t('columns.todos.email')} <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-2">
          <label className="form-label">{t('common.date_range')}</label>
          <select
            name="dateType"
            value={form.dateType || ''}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">{t('common.choose')}</option>
            <option value="createdAt">{t('columns.todos.createdAt')}</option>
            <option value="updatedAt">{t('columns.todos.updatedAt')}</option>
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label">{t('common.start_date')}</label>
          <input
            type="date"
            name="startDate"
            className="form-control"
            value={form.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-2">
          <label className="form-label">{t('common.end_date')}</label>
          <input
            type="date"
            name="endDate"
            className="form-control"
            value={form.endDate}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-2 d-flex gap-2">
          <button type="submit" className="btn btn-primary w-100">
            {t('common.search')}
          </button>

          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={() => {
              window.location.href = `${url}`;
            }}
          >
            {t('common.reset')}
          </button>
        </div>

        <div className="col-12 text-end text-muted small">
          Total. <strong>{totalCount}</strong>
        </div>
      </form>
    </>
  );
};

export default SearchForm;
