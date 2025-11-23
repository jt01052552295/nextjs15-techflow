'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';
import { fetchAllShopOrderAction } from '@/actions/shop/order/list';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faSpinner,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/components/context/LanguageContext';

interface SelectProps {
  name: string;
  control: any; // react-hook-form의 control
  defaultValue?: string;
  disabled?: boolean;
  onChange?: (idx: string) => void;
  className?: string;
  required?: boolean;
  label?: string; // 라벨 텍스트
  placeholder?: string;
  feedbackMessages?: {
    invalid?: string;
    valid?: string;
  };
  error?: string; // 오류 메시지
}

const ShopOrderSelect: React.FC<SelectProps> = ({
  name,
  control,
  defaultValue = '',
  disabled = false,
  onChange,
  className = '',
  required = false,
  label,
  placeholder,
  feedbackMessages,
  error,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  //  목록 조회
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['all-shop-orders', 'active'],
    queryFn: async () => {
      return await fetchAllShopOrderAction();
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });

  // 검색어에 따라 필터링된 목록
  const filteredList = searchTerm
    ? list.filter(
        (row) =>
          row.idx
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          row.ordNo?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : list;

  // 드롭다운 영역 밖 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.shop-order-select-container')) {
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
        render={({ field }) => {
          console.log(field.value, 'selected value');
          return (
            <div className="shop-order-select-container position-relative">
              {/* 선택된 사용자 표시 또는 입력 필드 */}
              <div
                className={`form-control d-flex align-items-center ${error ? 'is-invalid' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
              >
                <div className="d-flex align-items-center flex-grow-1">
                  {field.value &&
                  list.find(
                    (u) => u.idx.toString() === field.value?.toString(),
                  ) ? (
                    <span className="text-muted">
                      {
                        list.find(
                          (c) => c.idx.toString() === field.value?.toString(),
                        )?.ordNo
                      }
                    </span>
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

                  {/* 목록 */}
                  {isLoading ? (
                    <div className="text-center py-3">
                      <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                      {t('common.loading')}
                    </div>
                  ) : filteredList.length > 0 ? (
                    filteredList.map((row) => {
                      return (
                        <div
                          key={row.idx}
                          className={`dropdown-item d-flex align-items-center p-2 ${
                            field.value?.toString() === row.idx.toString()
                              ? 'active bg-primary text-white'
                              : ''
                          }`}
                          onClick={() => {
                            field.onChange(row.idx.toString());
                            if (onChange) onChange(row.idx.toString());
                            setIsOpen(false);
                            setSearchTerm('');
                          }}
                        >
                          <span className="flex-grow-1">
                            {row.idx} - {row.ordNo}
                          </span>
                        </div>
                      );
                    })
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
          );
        }}
      />
    </div>
  );
};

export default ShopOrderSelect;
