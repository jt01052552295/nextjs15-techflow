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
  onLike: (commentId: string) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
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
}: CommentListProps) => {
  const { t } = useLanguage();

  if (comments.length === 0) {
    return (
      <div className="text-center text-muted py-4">
        {t('common.no_comments')}
      </div>
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
          onDelete={() => onDelete(comment)}
          onLike={() => onLike(comment.uid)}
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
            {isFetchingNextPage ? t('common.loading') : t('common.load_more')}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentList;
