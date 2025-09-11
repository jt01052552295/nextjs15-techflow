'use client';
import { useMemo } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import { ITodosCommentRow } from '@/types/todos';
import { useInfiniteQuery } from '@tanstack/react-query';
import { practiceQK } from '@/lib/queryKeys/practice';
import { listAction } from '@/actions/practice/comments';
import CommentItem from './CommentItem';

interface ReplyListProps {
  todoId: string;
  parentId: number;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (comment: ITodosCommentRow) => void;
  onLike: (commentId: string) => void;
}

export default function ReplyList({
  todoId,
  parentId,
  onEdit,
  onDelete,
  onLike,
}: ReplyListProps) {
  const { t } = useLanguage();

  const replyBase = {
    todoId,
    parentIdx: parentId,
    sortBy: 'createdAt',
    order: 'asc',
  } as const;

  // 답글 데이터 가져오기 (무한 스크롤 방식)
  const {
    data: repliesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: practiceQK.comments(replyBase),
    queryFn: ({ pageParam }) => {
      // 명시적으로 타입을 지정하여 호환성 문제 해결
      const cursor = pageParam as string | null | undefined;
      return listAction({ ...replyBase, cursor });
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });

  // 답글 데이터 가공
  const replies: ITodosCommentRow[] = useMemo(() => {
    const list = repliesData?.pages.flatMap((p) => p.items) ?? [];
    return [...new Map(list.map((item) => [item.uid, item])).values()];
  }, [repliesData]);

  if (isLoading) {
    return (
      <div className="replies-loading text-center p-3">
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </div>
        {t('common.loading_replies')}
      </div>
    );
  }

  if (!replies || replies.length === 0) {
    return (
      <div className="no-replies text-muted p-3">{t('common.no_replies')}</div>
    );
  }

  return (
    <div className="replies-container mt-3">
      <div className="replies-list ms-4 border-start border-3">
        {replies.map((reply) => (
          <CommentItem
            key={reply.uid}
            comment={reply}
            todoId={todoId}
            onReply={() => {}} // 답글에는 답글을 달 수 없음
            onEdit={onEdit}
            onDelete={() => onDelete(reply)}
            onLike={() => onLike(reply.uid)}
          />
        ))}

        {/* 더보기 버튼 */}
        {hasNextPage && (
          <div className="text-center mt-3">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage
                ? t('common.loading')
                : t('common.load_more_replies')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
