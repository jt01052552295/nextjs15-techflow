'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/context/LanguageContext';
interface ModalProps {
  children: React.ReactNode;
  title: string;
  returnHref: string;
}

export default function Modal({ children, title, returnHref }: ModalProps) {
  const router = useRouter();
  const { t } = useLanguage();

  // ESC 키를 눌렀을 때 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  // 모달 바깥 영역 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      router.back();
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      onClick={handleBackdropClick}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <Link
              href={returnHref}
              className="btn-close"
              aria-label="Close"
            ></Link>
          </div>
          {children}
          <div className="modal-footer">
            <Link href={returnHref} className="btn btn-secondary">
              {t('common.cancel')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
