'use client';

import { useCallback } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';

interface Props {
  orderBy: 'latest' | 'popular';
  onChange: (order: 'latest' | 'popular') => void;
}

export default function CommentSortBar({ orderBy, onChange }: Props) {
  const { t } = useLanguage();
  const handleChange = useCallback(
    (order: 'latest' | 'popular') => {
      if (order !== orderBy) {
        onChange(order);
      }
    },
    [orderBy, onChange],
  );

  return (
    <div className="d-flex mb-3">
      <button
        className={`btn btn-sm me-2 ${orderBy === 'latest' ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => handleChange('latest')}
      >
        {t('common.latest')}
      </button>
      <button
        className={`btn btn-sm ${orderBy === 'popular' ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => handleChange('popular')}
      >
        {t('common.popular')}
      </button>
    </div>
  );
}
