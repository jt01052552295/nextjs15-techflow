'use client';

import { ITodosComment } from '@/types/todos';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import {
  faThumbsUp,
  faSave,
  faTimes,
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { maskingName, maskingEmail } from '@/lib/util';
import Image from 'next/image';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/components/context/LanguageContext';

dayjs.extend(relativeTime);
dayjs.locale('ko');

type Props = {
  reply: ITodosComment;
  editId: number | null;
  editContent: string;
  setEditContent: (val: string) => void;
  onEdit: (item: ITodosComment) => void;
  onEditCancel: () => void;
  onEditSave: (idx: number) => void;
  onDelete: (idx: number) => void;
  onToggleLike: (item: ITodosComment) => void;
  isPending: boolean;
};

export default function ReplyItem({
  reply,
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
  const isEditing = editId === reply.idx;

  const staticUrl = process.env.NEXT_PUBLIC_STATIC_URL || '';
  const profile = reply.user?.profile?.[0];
  const profileImageUrl = profile?.url ? `${staticUrl}${profile.url}` : null;

  return (
    <div className="border rounded p-2 mb-2 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-2">
        {/* 프로필 + 이름/이메일 */}
        <div className="d-flex align-items-center gap-2">
          {profileImageUrl ? (
            <Image
              src={profileImageUrl}
              alt={reply.user?.name || ''}
              width={32}
              height={32}
              className="rounded-circle border"
            />
          ) : (
            <div
              className="avatar-placeholder rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white border"
              style={{ width: 32, height: 32 }}
            >
              <FontAwesomeIcon icon={faUser} />
            </div>
          )}

          <div className="d-flex gap-1">
            <span className="fw-semibold">
              {maskingName(reply.user?.name ?? '')}
            </span>
            <small className="text-muted">
              {maskingEmail(reply.user?.email ?? '')}
            </small>
          </div>
        </div>

        {/* 작성일 */}
        <small className="text-muted">{dayjs(reply.createdAt).fromNow()}</small>
      </div>

      {isEditing ? (
        <div className="mb-2">
          <textarea
            className="form-control"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
          />
          <div className="mt-1 d-flex gap-2 justify-content-end">
            <button
              className="btn btn-sm btn-success"
              onClick={() => onEditSave(reply.idx)}
              disabled={isPending}
            >
              <FontAwesomeIcon icon={faSave} /> {t('common.save')}
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={onEditCancel}
              disabled={isPending}
            >
              <FontAwesomeIcon icon={faTimes} /> {t('common.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-2">{reply.content}</p>
      )}

      <div className="d-flex gap-3">
        <button
          className={`btn btn-sm ${reply.liked ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onToggleLike(reply)}
          disabled={isPending}
        >
          <FontAwesomeIcon icon={faThumbsUp} /> {reply.likeCount}
        </button>

        {!isEditing && (
          <>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onEdit(reply)}
              disabled={isPending}
            >
              <FontAwesomeIcon icon={faPen} /> {t('common.edit')}
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => onDelete(reply.idx)}
              disabled={isPending}
            >
              <FontAwesomeIcon icon={faTrash} /> {t('common.delete')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
