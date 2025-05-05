'use client';

import React, { useState, useEffect, useRef } from 'react';

type Props = {
  value: string;
  onSave: (
    newValue: string,
    onSuccess: (val: string) => void,
    onError: () => void,
  ) => void;
};

const EditableCell = ({ value, onSave }: Props) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        editing &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        handleCancel(); // 바깥 클릭 시 취소
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editing]);

  const handleSave = () => {
    if (draft === value) {
      setEditing(false);
      return;
    }

    onSave(
      draft,
      (updatedVal) => {
        setEditing(false);
        setDraft(updatedVal); // 외부 갱신 없어도 반영
      },
      () => {
        // 실패 시 draft 유지, 편집 유지
      },
    );
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div
      ref={wrapperRef}
      style={{ display: 'inline-block', minWidth: '100px' }}
    >
      {editing ? (
        <div className="d-flex gap-1">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="form-control form-control-sm"
          />
          <button className="btn btn-sm btn-primary" onClick={handleSave}>
            저장
          </button>
          <button className="btn btn-sm btn-secondary" onClick={handleCancel}>
            취소
          </button>
        </div>
      ) : (
        <span
          onClick={() => setEditing(true)}
          style={{
            cursor: 'pointer',
            display: 'inline-block',
            minWidth: '100px',
          }}
        >
          {value || '―'}
        </span>
      )}
    </div>
  );
};

export default EditableCell;
