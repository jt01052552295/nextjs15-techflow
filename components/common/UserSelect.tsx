// /home/techflow/admin/components/common/UserSelect.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';
import { fetchActiveUsersAction } from '@/actions/user/list';
import UserProfileDisplay from '@/components/common/UserProfileDisplay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faSpinner,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/components/context/LanguageContext';

interface UserSelectProps {
  name: string;
  control: any; // react-hook-form의 control
  defaultValue?: string;
  disabled?: boolean;
  onChange?: (userId: string) => void;
  className?: string;
  showEmail?: boolean; // 이메일 표시 여부
  required?: boolean;
  label?: string; // 라벨 텍스트
  placeholder?: string;
  feedbackMessages?: {
    invalid?: string;
    valid?: string;
  };
  error?: string; // 오류 메시지
}

const UserSelect: React.FC<UserSelectProps> = ({
  name,
  control,
  defaultValue = '',
  disabled = false,
  onChange,
  className = '',
  showEmail = true,
  required = false,
  label,
  placeholder,
  feedbackMessages,
  error,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // 사용자 목록 조회
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', 'active'],
    queryFn: async () => {
      return await fetchActiveUsersAction();
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });

  // 검색어에 따라 필터링된 사용자 목록
  const filteredUsers = searchTerm
    ? users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : users;

  // 드롭다운 영역 밖 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-select-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`mb-2 ${className}`}>
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <div className="user-select-container position-relative">
            {/* 선택된 사용자 표시 또는 입력 필드 */}
            <div
              className={`form-control d-flex align-items-center ${error ? 'is-invalid' : ''}`}
              onClick={() => !disabled && setIsOpen(!isOpen)}
              style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
              <div className="d-flex align-items-center flex-grow-1">
                {field.value && users.find((u) => u.id === field.value) ? (
                  <UserProfileDisplay
                    user={users.find((u) => u.id === field.value)!}
                    showEmail={showEmail}
                    size={32}
                  />
                ) : (
                  <span className="text-muted">
                    {placeholder || t('common.choose')}
                  </span>
                )}
              </div>
              {field.value && (
                <button
                  type="button"
                  className="btn btn-sm text-danger border-0 ms-2"
                  onClick={(e) => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    field.onChange('');
                    if (onChange) onChange('');
                    setIsOpen(false);
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>

            {/* 드롭다운 메뉴 */}
            {isOpen && (
              <div
                className="dropdown-menu d-block shadow w-100 p-2"
                style={{ maxHeight: '300px', overflowY: 'auto' }}
              >
                {/* 검색 필드 */}
                <div className="mb-2 position-relative">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={t('common.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="position-absolute top-50 end-0 translate-middle-y me-2 text-muted"
                  />
                </div>

                {/* 사용자 목록 */}
                {isLoading ? (
                  <div className="text-center py-3">
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    {t('common.loading')}
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`dropdown-item d-flex align-items-center p-2 ${
                        field.value === user.id
                          ? 'active bg-primary text-white'
                          : ''
                      }`}
                      onClick={() => {
                        field.onChange(user.id);
                        if (onChange) onChange(user.id);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <UserProfileDisplay
                        user={user}
                        showEmail={showEmail}
                        size={32}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 text-muted">
                    {t('common.no_items')}
                  </div>
                )}
              </div>
            )}

            {/* 피드백 메시지 */}
            {error && <div className="invalid-feedback d-block">{error}</div>}
            {!error && field.value && feedbackMessages?.valid && (
              <div className="valid-feedback d-block">
                {feedbackMessages.valid}
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default UserSelect;
