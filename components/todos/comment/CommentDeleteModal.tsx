'use client';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function CommentDeleteModal({
  visible,
  onCancel,
  onConfirm,
}: Props) {
  if (!visible) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">댓글 삭제</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>
          <div className="modal-body">
            <p>정말 삭제하시겠습니까?</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>
              취소
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
