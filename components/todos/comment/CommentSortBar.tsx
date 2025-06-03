'use client';

import { useCallback } from 'react';

interface Props {
  orderBy: 'latest' | 'popular';
  onChange: (order: 'latest' | 'popular') => void;
}

export default function CommentSortBar({ orderBy, onChange }: Props) {
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
        최신순
      </button>
      <button
        className={`btn btn-sm ${orderBy === 'popular' ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={() => handleChange('popular')}
      >
        인기순
      </button>
    </div>
  );
}
