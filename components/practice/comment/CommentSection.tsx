'use client';
import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCommentsInfinite } from '@/hooks/react-query/usePractice';
import { ITodosCommentRow, ITodosCommentPart } from '@/types/todos';
import { practiceQK } from '@/lib/queryKeys/practice';
import SortOptions from './SortOptions';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import CommentDeleteModal from './CommentDeleteModal';

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
  const [commentToDelete, setCommentToDelete] =
    useState<ITodosCommentRow | null>(null);

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
    onSuccess: (updatedData, newComment) => {
      console.log(updatedData);

      // 1. 일반 댓글인 경우 (parentIdx가 없는 경우)
      if (!newComment.parentIdx) {
        // 일반 댓글 목록 캐시에 새 댓글 추가
        queryClient.setQueryData(
          practiceQK.comments(rootBase),
          (oldData: any) => {
            if (!oldData || !oldData.pages || oldData.pages.length === 0)
              return oldData;

            // 첫 페이지에 새 댓글 추가
            const updatedPages = [...oldData.pages];
            updatedPages[0] = {
              ...updatedPages[0],
              items: [newComment, ...updatedPages[0].items],
            };

            return {
              ...oldData,
              pages: updatedPages,
            };
          },
        );
      } else {
        // 2-1. 부모 댓글의 replyCount 증가
        queryClient.setQueryData(
          practiceQK.comments(rootBase),
          (oldData: any) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                items: page.items.map((comment: ITodosCommentRow) =>
                  comment.idx === newComment.parentIdx
                    ? { ...comment, replyCount: (comment.replyCount || 0) + 1 }
                    : comment,
                ),
              })),
            };
          },
        );
        // 2-2. 답글 목록 캐시에 새 답글 추가
        const replyBase = {
          todoId,
          parentIdx: newComment.parentIdx,
          sortBy: 'createdAt',
          order: 'asc',
        } as const;
        queryClient.invalidateQueries({
          queryKey: practiceQK.comments(replyBase),
        });
      }
      // 성공 시 댓글 목록 갱신 및 폼 초기화
      queryClient.invalidateQueries({
        queryKey: practiceQK.comments(rootBase),
      });

      setCommentForm({ content: '', parentIdx: null });
      setReplyToId(null);
    },
  });

  // 댓글 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateCommentAction({ todoId, uid: id, content }),
    onSuccess: (updatedData, variables) => {
      // 캐시를 직접 업데이트
      queryClient.setQueryData(
        practiceQK.comments(rootBase),
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              items: page.items.map((comment: ITodosCommentRow) =>
                comment.uid === variables.id
                  ? { ...comment, content: variables.content }
                  : comment,
              ),
            })),
          };
        },
      );

      if (updatedData.data?.parentIdx) {
        const replyBase = {
          todoId,
          parentIdx: updatedData.data.parentIdx,
          sortBy: 'createdAt',
          order: 'asc',
        } as const;

        queryClient.invalidateQueries({
          queryKey: practiceQK.comments(replyBase),
        });
      }

      // 백그라운드에서 데이터 최신화를 위해 쿼리 무효화도 함께 수행
      queryClient.invalidateQueries({
        queryKey: practiceQK.comments(rootBase),
      });
    },
  });

  // 댓글 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (row: ITodosCommentPart) => deleteCommentAction(row),
    onSuccess: (_, deletedComment) => {
      // 캐시를 직접 업데이트하여 UI에서 즉시 제거
      queryClient.setQueryData(
        practiceQK.comments(rootBase),
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              items: page.items.filter(
                (comment: ITodosCommentRow) =>
                  comment.uid !== deletedComment.uid,
              ),
            })),
          };
        },
      );

      // 삭제된 댓글이 답글인 경우 해당 답글 목록 쿼리도 무효화
      if (deletedComment.parentIdx) {
        const replyBase = {
          todoId,
          parentIdx: deletedComment.parentIdx,
          sortBy: 'createdAt',
          order: 'asc',
        } as const;

        queryClient.invalidateQueries({
          queryKey: practiceQK.comments(replyBase),
        });
      }
      queryClient.invalidateQueries({
        queryKey: practiceQK.comments(rootBase),
      });
    },
  });

  // 좋아요 토글 mutation
  const likeMutation = useMutation({
    mutationFn: (commentId: number) => likeCommentAction({ commentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: practiceQK.comments(rootBase),
      });

      queryClient.invalidateQueries({
        queryKey: ['practice', 'comments'],
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
    console.log('handleEdit');
    console.log(id, content);
    updateMutation.mutate({ id, content });
  };

  // 댓글 삭제 핸들러
  const handleDelete = (comment: ITodosCommentRow) => {
    console.log('CommentSection handleDelete:', comment);
    setCommentToDelete(comment);
  };

  // 모달에서 삭제 취소
  const cancelDelete = () => {
    setCommentToDelete(null);
  };

  // 모달에서 삭제 확인
  const deleteComment = () => {
    if (commentToDelete) {
      console.log('CommentSection deleteComment:', commentToDelete);
      deleteMutation.mutate(commentToDelete);
      setCommentToDelete(null);
    }
  };

  // 댓글 목록에서 부모 댓글만 필터링
  const parentComments = useMemo(() => {
    return comments.filter((comment) => comment.parentIdx === null);
  }, [comments]);

  // 답글 작성 핸들러
  const handleReplyTo = (commentId: number) => {
    console.log('handleReplyTo', replyToId, commentId);
    if (replyToId === commentId) {
      setReplyToId(null);
      setCommentForm({ content: '', parentIdx: null });
    } else {
      setReplyToId(commentId);
      setCommentForm({ content: '', parentIdx: commentId });
    }
  };

  // 답글 취소 핸들러
  const handleReplyCancel = () => {
    setReplyToId(null);
    setCommentForm({ content: '', parentIdx: null });
  };

  // 좋아요 핸들러
  const handleLike = (commentId: number) => {
    console.log('handleLike', commentId);
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
        onSubmit={handleCommentSubmit}
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
        activeReplyId={replyToId}
        onReplySubmit={handleCommentSubmit}
        onReplyCancel={handleReplyCancel}
        replyFormPending={createMutation.isPending}
      />

      <CommentDeleteModal
        visible={commentToDelete !== null}
        onCancel={cancelDelete}
        onConfirm={deleteComment}
      />
    </div>
  );
}
