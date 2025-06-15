'use client';

import CommentItem from './CommentItem';
import { ITodosComment } from '@/types/todos';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';

type Props = {
  comments: ITodosComment[];
  editId: number | null;
  editContent: string;
  setEditContent: (value: string) => void;
  onEdit: (item: ITodosComment) => void;
  onEditSave: (idx: number) => void;
  onEditCancel: () => void;
  onDelete: (idx: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
};

export default function CommentList({
  comments,
  editId,
  editContent,
  setEditContent,
  onEdit,
  onEditSave,
  onEditCancel,
  onDelete,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}: Props) {
  const { t } = useLanguage();
  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  return (
    <ul className="list-group">
      {comments.length > 0 ? (
        <>
          {comments.map((item) => (
            <CommentItem
              key={item.idx}
              item={item}
              isEditing={editId === item.idx}
              editContent={editContent}
              setEditContent={setEditContent}
              onEdit={onEdit}
              onEditSave={onEditSave}
              onEditCancel={onEditCancel}
              onDelete={onDelete}
            />
          ))}
          <li className="list-group-item text-center" ref={ref}>
            {isLoading
              ? t('common.loading')
              : hasMore
                ? t('common.more')
                : t('common.all_items_loaded')}
          </li>
          {/* {hasMore && (
            <li className="list-group-item text-center">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={onLoadMore}
                disabled={isLoading}
              >
                {isLoading ? '불러오는 중...' : '더보기'}
              </button>
            </li>
          )} */}
        </>
      ) : (
        <li className="list-group-item text-muted">{t('common.no_items')}</li>
      )}
    </ul>
  );
}
