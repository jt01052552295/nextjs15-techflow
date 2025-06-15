'use client';

import { useEffect, useState } from 'react';
import { ITodosComment } from '@/types/todos';
import { listCommentAction } from '@/actions/todos/comment';

interface UseCommentListParams {
  todoId: string;
  orderBy?: 'latest' | 'popular';
  take?: number;
}

export function useCommentList({
  todoId,
  orderBy = 'latest',
  take = 20,
}: UseCommentListParams) {
  const [comments, setComments] = useState<ITodosComment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // orderBy 변경 시 목록 초기화
  useEffect(() => {
    resetAndLoad();
  }, [orderBy]);

  const resetAndLoad = async () => {
    setComments([]);
    setPage(1);
    setHasMore(true);
    await fetchComments(1, true);
  };

  const fetchComments = async (pageToLoad: number, reset = false) => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    const response = await listCommentAction({
      todoId,
      orderBy,
      page: pageToLoad,
      take,
    });

    if (response) {
      const existingIds = new Set(reset ? [] : comments.map((c) => c.idx));
      const newComments = response.items.filter((c) => !existingIds.has(c.idx));

      setComments((prev) => (reset ? newComments : [...prev, ...newComments]));
      setPage(pageToLoad + 1);
      setHasMore(response.hasMore);
      setTotalCount(response.totalCount);
    }
    setIsLoading(false);
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchComments(page);
    }
  };

  return {
    comments,
    setComments,
    loadMore,
    hasMore,
    isLoading,
    totalCount,
    setTotalCount,
  };
}
