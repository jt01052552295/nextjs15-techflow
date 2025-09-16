'use client';
import { useLanguage } from '@/components/context/LanguageContext';
import { ITodosCommentRow } from '@/types/todos';
import CommentItem from './CommentItem';

interface CommentListProps {
  todoId: string;
  comments: ITodosCommentRow[];
  onReply: (commentId: number) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (comment: ITodosCommentRow) => void;
  onLike: (commentId: number) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  activeReplyId: number | null;
  onReplySubmit: (content: string, parentId: number) => void;
  onReplyCancel: () => void;
  replyFormPending: boolean;
}

const CommentList = ({
  todoId,
  comments,
  onReply,
  onEdit,
  onDelete,
  onLike,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  activeReplyId,
  onReplySubmit,
  onReplyCancel,
  replyFormPending,
}: CommentListProps) => {
  const { t } = useLanguage();

  // 답글 삭제를 위한 별도 핸들러 추가
  const handleReplyDelete = (reply: ITodosCommentRow) => {
    onDelete(reply); // 받은 reply 객체를 그대로 상위 컴포넌트에 전달
  };

  // 답글 좋아요를 위한 별도 핸들러 추가
  const handleReplyLike = (replyId: number) => {
    onLike(replyId); // 받은 replyId를 그대로 상위 컴포넌트에 전달
  };

  if (comments.length === 0) {
    return (
      <div className="text-center text-muted py-4">{t('common.no_items')}</div>
    );
  }

  return (
    <div className="comments-list">
      {/* 댓글 목록 */}
      {comments.map((comment) => (
        <CommentItem
          key={comment.uid}
          todoId={todoId}
          comment={comment}
          onReply={() => onReply(comment.idx)}
          onEdit={onEdit}
          onDelete={() => onDelete(comment)} // 댓글 자체 삭제용
          onLike={() => onLike(comment.idx)} // 댓글 자체 좋아요용
          isReplyFormOpen={activeReplyId === comment.idx}
          onReplySubmit={onReplySubmit}
          onReplyCancel={onReplyCancel}
          replyFormPending={replyFormPending}
          // 새로운 props 추가
          onReplyDelete={handleReplyDelete} // 답글 삭제용 별도 핸들러
          onReplyLike={handleReplyLike} // 답글 좋아요용 별도 핸들러
        />
      ))}

      {/* 더 보기 버튼 */}
      {hasNextPage && (
        <div className="text-center mt-3">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? t('common.loading') : t('common.more')}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentList;
