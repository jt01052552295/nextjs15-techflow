'use client';

import { ITodosComment } from '@/types/todos';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import ReplyItem from './ReplyItem';
import { useLanguage } from '@/components/context/LanguageContext';

type Props = {
  replies: ITodosComment[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;

  // 수정 관련
  editId: number | null;
  editContent: string;
  setEditContent: (val: string) => void;
  onEdit: (item: ITodosComment) => void;
  onEditCancel: () => void;
  onEditSave: (idx: number) => void;

  // 삭제
  onDelete: (idx: number) => void;

  // 좋아요
  onToggleLike: (item: ITodosComment) => void;

  // 트랜지션 상태
  isPending: boolean;
};

export default function ReplyList({
  replies,
  loading,
  hasMore,
  onLoadMore,
  editId,
  editContent,
  setEditContent,
  onEdit,
  onEditCancel,
  onEditSave,
  onDelete,
  onToggleLike,
  isPending,
}: Props) {
  const { t } = useLanguage();
  const { ref, inView } = useInView({ threshold: 1 });

  useEffect(() => {
    if (inView && hasMore && !loading) {
      onLoadMore();
    }
  }, [inView, hasMore, loading, onLoadMore]);

  return (
    <div className="mt-3">
      {replies.length === 0 && !loading && (
        <p className="text-muted">{t('common.no_items')}</p>
      )}

      {replies.map((reply) => (
        <ReplyItem
          key={reply.uid}
          reply={reply}
          editId={editId}
          editContent={editContent}
          setEditContent={setEditContent}
          onEdit={onEdit}
          onEditCancel={onEditCancel}
          onEditSave={onEditSave}
          onDelete={onDelete}
          onToggleLike={onToggleLike}
          isPending={isPending}
        />
      ))}

      {loading && <p className="text-muted">{t('common.loading')}</p>}

      {hasMore && !loading && <div ref={ref} style={{ height: 1 }} />}
    </div>
  );
}
