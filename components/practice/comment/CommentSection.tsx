'use client';
import { useState, useMemo } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCommentsInfinite } from '@/hooks/react-query/usePractice';
import { ITodosCommentRow, ITodosCommentPart } from '@/types/todos';
import { practiceQK } from '@/lib/queryKeys/practice';
import SortOptions from './SortOptions';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

// 댓글 생성/수정/삭제 액션 함수 가져오기
import {
  createAction as createCommentAction,
  updateAction as updateCommentAction,
  deleteCommentAction as deleteCommentAction,
  likeAction as likeCommentAction,
} from '@/actions/practice/comments';

type CommentFormData = {
  content: string;
  parentIdx?: number | null;
};

type Props = {
  todoId: string;
};

export default function CommentSection({ todoId }: Props) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // 상태 관리
  const [sort, setSort] = useState<{
    by: 'createdAt' | 'replyCount' | 'likeCount';
    order: 'asc' | 'desc';
  }>({ by: 'createdAt', order: 'desc' });

  const [commentForm, setCommentForm] = useState<CommentFormData>({
    content: '',
  });

  const [replyToId, setReplyToId] = useState<number | null>(null);

  const rootBase = useMemo(
    () =>
      ({
        todoId,
        sortBy: sort.by,
        order: sort.order,
        limit: 20,
      }) as const,
    [todoId, sort],
  );

  // 댓글 목록 가져오기
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommentsInfinite(rootBase);

  // 댓글 목록 가공
  const comments: ITodosCommentRow[] = useMemo(() => {
    const list = commentsData?.pages.flatMap((p) => p.items) ?? [];
    return [...new Map(list.map((item) => [item.uid, item])).values()];
  }, [commentsData]);

  // 댓글 등록 mutation
  const createMutation = useMutation({
    mutationFn: (data: { content: string; parentIdx?: number | null }) =>
      createCommentAction({ todoId, ...data }),
    onSuccess: () => {
      // 성공 시 댓글 목록 갱신 및 폼 초기화
      queryClient.invalidateQueries({
        queryKey: practiceQK.comments(rootBase),
      });
      setCommentForm({ content: '' });
      setReplyToId(null);
    },
  });

  // 댓글 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateCommentAction({ uid: id, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: practiceQK.comments(rootBase),
      });
    },
  });

  // 댓글 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (row: ITodosCommentPart) => deleteCommentAction(row),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: practiceQK.comments(rootBase),
      });
    },
  });

  // 좋아요 토글 mutation
  const likeMutation = useMutation({
    mutationFn: (id: string) => likeCommentAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: practiceQK.comments(rootBase),
      });
    },
  });

  // 정렬 방식 변경 핸들러
  const handleSortChange = (
    sortType: 'createdAt' | 'replyCount' | 'likeCount',
  ) => {
    setSort({ by: sortType, order: 'desc' });
  };

  // 댓글 작성 핸들러
  const handleCommentSubmit = (content: string, parentIdx?: number | null) => {
    if (!content.trim()) return;

    createMutation.mutate({
      content,
      parentIdx: parentIdx || undefined,
    });
  };

  // 댓글 수정 핸들러
  const handleEdit = (id: string, content: string) => {
    updateMutation.mutate({ id, content });
  };

  // 댓글 삭제 핸들러
  const handleDelete = (comment: ITodosCommentRow) => {
    if (window.confirm(t('common.confirm_delete'))) {
      deleteMutation.mutate(comment);
    }
  };

  // 댓글 목록에서 부모 댓글만 필터링
  const parentComments = useMemo(() => {
    return comments.filter((comment) => comment.parentIdx === null);
  }, [comments]);

  // 답글 작성 핸들러
  const handleReplyTo = (commentId: number) => {
    setReplyToId(commentId);
    setCommentForm({ content: '', parentIdx: commentId });
  };

  // 답글 취소 핸들러
  const handleReplyCancel = () => {
    setReplyToId(null);
  };

  // 좋아요 핸들러
  const handleLike = (commentId: string) => {
    likeMutation.mutate(commentId);
  };

  return (
    <div className="comment-section">
      {/* 댓글 정렬 옵션 */}
      <SortOptions
        sort={sort}
        onSortChange={handleSortChange}
        onOrderChange={(order) => setSort({ ...sort, order })}
      />

      {/* 댓글 작성 폼 */}
      <CommentForm
        initialContent={commentForm.content}
        isReply={replyToId !== null}
        replyToId={replyToId}
        onSubmit={handleCommentSubmit}
        onCancel={handleReplyCancel}
        isPending={createMutation.isPending}
      />

      {/* 댓글 목록 */}
      <CommentList
        todoId={todoId}
        comments={parentComments}
        onReply={handleReplyTo}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLike={handleLike}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage || false}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}
