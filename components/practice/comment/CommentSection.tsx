'use client';
import { useState, useMemo } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCommentsInfinite } from '@/hooks/react-query/usePractice';
import { ITodosCommentRow, ITodosCommentPart } from '@/types/todos';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThumbsUp,
  faReply,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faSort,
} from '@fortawesome/free-solid-svg-icons';
import TextareaAutosize from 'react-textarea-autosize';
import { practiceQK } from '@/lib/queryKeys/practice';

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
  const { dictionary, t } = useLanguage();
  const queryClient = useQueryClient();

  // 상태 관리
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'replyCount' | 'likeCount'
  >('createdAt');
  const [commentForm, setCommentForm] = useState<CommentFormData>({
    content: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyToId, setReplyToId] = useState<number | null>(null);

  const rootBase = {
    todoId,
    sortBy: 'createdAt',
    order: 'desc',
    limit: 20,
  } as const;

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

  console.log(comments);

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
      setEditingId(null);
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
    setSortBy(sortType);
  };

  // 댓글 작성 핸들러
  const handleSubmitComment = () => {
    if (!commentForm.content.trim()) return;

    createMutation.mutate({
      content: commentForm.content,
      parentIdx: replyToId || undefined,
    });
  };

  // 댓글 수정 핸들러
  const handleUpdateComment = (id: string, content: string) => {
    updateMutation.mutate({ id, content });
  };

  // 답글 폼 토글
  const toggleReplyForm = (parentIdx: number | null) => {
    setReplyToId(parentIdx);
    if (parentIdx) {
      setCommentForm({ content: '', parentIdx });
    }
  };

  // 수정 모드 토글
  const toggleEditMode = (comment: ITodosCommentRow | null) => {
    if (comment) {
      setEditingId(comment.uid);
      setCommentForm({ content: comment.content });
    } else {
      setEditingId(null);
    }
  };

  return (
    <div className="comment-section">
      {/* 댓글 정렬 옵션 */}
      <div className="d-flex justify-content-end mb-3">
        <div className="btn-group">
          <button
            type="button"
            className={`btn btn-sm ${sortBy === 'createdAt' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleSortChange('createdAt')}
          >
            <FontAwesomeIcon icon={faSort} /> {t('common.createdAt')}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${sortBy === 'replyCount' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleSortChange('replyCount')}
          >
            <FontAwesomeIcon icon={faSort} /> {t('common.replyCount')}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${sortBy === 'likeCount' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleSortChange('likeCount')}
          >
            <FontAwesomeIcon icon={faThumbsUp} /> {t('common.likeCount')}
          </button>
        </div>
      </div>

      {/* 댓글 작성 폼 */}
      <div className="comment-form mb-4">
        <h6>
          {replyToId ? t('common.write_reply') : t('common.write_comment')}
        </h6>
        <div className="d-flex">
          <TextareaAutosize
            className="form-control me-2"
            placeholder={t('common.write_comment_placeholder')}
            value={commentForm.content}
            onChange={(e) =>
              setCommentForm({ ...commentForm, content: e.target.value })
            }
            minRows={2}
            maxRows={5}
          />
          <div className="d-flex flex-column">
            <button
              className="btn btn-primary mb-1"
              onClick={handleSubmitComment}
              disabled={createMutation.isPending || !commentForm.content.trim()}
            >
              {createMutation.isPending
                ? t('common.submitting')
                : t('common.submit')}
            </button>
            {replyToId && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => toggleReplyForm(null)}
              >
                {t('common.cancel')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="text-center text-muted py-4">
            {t('common.no_comments')}
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.uid}
              className={`comment-item p-3 mb-3 ${comment.parentIdx ? 'ms-4 border-start border-3' : ''} border-bottom`}
            >
              {editingId === comment.uid ? (
                <div className="edit-form">
                  <TextareaAutosize
                    className="form-control mb-2"
                    value={commentForm.content}
                    onChange={(e) =>
                      setCommentForm({
                        ...commentForm,
                        content: e.target.value,
                      })
                    }
                    minRows={2}
                    maxRows={5}
                  />
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() =>
                        handleUpdateComment(comment.uid, commentForm.content)
                      }
                      disabled={updateMutation.isPending}
                    >
                      <FontAwesomeIcon icon={faSave} /> {t('common.save')}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => toggleEditMode(null)}
                    >
                      <FontAwesomeIcon icon={faTimes} /> {t('common.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>{comment.idx}</strong>
                    </div>
                    <small className="text-muted">{comment.createdAt}</small>
                  </div>
                  <div className="mt-2 mb-3">{comment.content}</div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => likeMutation.mutate(comment.uid)}
                        disabled={likeMutation.isPending}
                      >
                        <FontAwesomeIcon icon={faThumbsUp} />{' '}
                        {comment.likeCount || 0}
                      </button>
                      {!comment.parentIdx && (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => toggleReplyForm(comment.idx)}
                        >
                          <FontAwesomeIcon icon={faReply} /> {t('common.reply')}
                        </button>
                      )}
                    </div>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => toggleEditMode(comment)}
                      >
                        <FontAwesomeIcon icon={faEdit} /> {t('common.edit')}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          if (window.confirm(t('common.confirm_delete'))) {
                            deleteMutation.mutate(comment);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <FontAwesomeIcon icon={faTrash} /> {t('common.delete')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}

        {/* 더 보기 버튼 */}
        {hasNextPage && (
          <div className="text-center mt-3">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? t('common.loading') : t('common.load_more')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
