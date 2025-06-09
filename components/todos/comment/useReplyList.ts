'use client';

import { useEffect, useState, useCallback } from 'react';
import { ITodosComment } from '@/types/todos';
import { listReplyAction } from '@/actions/todos/comment/reply';

type UseReplyListParams = {
  todoId: string;
  parentIdx: number;
};

export function useReplyList({ todoId, parentIdx }: UseReplyListParams) {
  const [replies, setReplies] = useState<ITodosComment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const res = await listReplyAction({ todoId, parentIdx, page, take: 10 });

    if (res?.items) {
      setReplies((prev) => [...prev, ...res.items]);
      setPage((prev) => prev + 1);
      setHasMore(res.hasMore);
    } else {
      setHasMore(false);
    }

    setLoading(false);
  }, [todoId, parentIdx, page, hasMore, loading]);

  const resetAndReload = useCallback(async () => {
    setReplies([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);

    const res = await listReplyAction({ todoId, parentIdx, page: 1, take: 10 });

    if (res?.items) {
      setReplies(res.items);
      setPage(2);
      setHasMore(res.hasMore);
    } else {
      setHasMore(false);
    }

    setLoading(false);
  }, [todoId, parentIdx]);

  useEffect(() => {
    resetAndReload();
  }, [todoId, parentIdx, resetAndReload]);

  return {
    replies,
    setReplies,
    loadMore,
    hasMore,
    loading,
    resetAndReload,
  };
}
