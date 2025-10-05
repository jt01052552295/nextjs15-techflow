'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faExclamationTriangle,
  faFile,
} from '@fortawesome/free-solid-svg-icons';

import { isImageFile } from '@/lib/util';

interface ThumbnailWidgetProps {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
}

const ThumbnailWidget: React.FC<ThumbnailWidgetProps> = ({
  url,
  width = 50,
  height = 50,
  alt = '이미지',
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isImage, setIsImage] = useState(true);
  const staticUrl = process.env.NEXT_PUBLIC_STATIC_URL || '';

  const placeholderImage = '/images/placeholder.png';
  // 유효한 이미지 URL 여부 확인
  const hasValidUrl = url && isImageFile(url);
  const imageUrl = hasValidUrl ? `${staticUrl}${url}` : placeholderImage;

  useEffect(() => {
    // URL이 있을 때만 이미지 타입 체크
    if (url) {
      setIsImage(isImageFile(url));
    } else {
      setIsImage(false);
    }
  }, [url]);

  const handleImageError = () => {
    setImageError(true);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (!isImage || imageError || !url) {
    return (
      <div
        className={`d-flex align-items-center justify-content-center bg-light ${className}`}
        style={{ width, height, borderRadius: '4px' }}
      >
        {!isImage ? (
          <FontAwesomeIcon
            icon={faFile}
            className="text-secondary"
            title={url ? url.split('/').pop() : '파일 없음'}
          />
        ) : (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-warning"
            title="이미지 로드 실패"
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="position-relative d-inline-block">
        <Image
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          style={{ objectFit: 'cover', cursor: 'pointer', borderRadius: '4px' }}
          className={`img-thumbnail ${className}`}
          onClick={openModal}
          onError={handleImageError}
          unoptimized={imageUrl.startsWith('http') || imageUrl.startsWith('//')}
        />
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-10 d-flex align-items-center justify-content-center"
          style={{
            opacity: 0,
            transition: 'opacity 0.2s',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '0')}
          onClick={openModal}
        >
          <FontAwesomeIcon icon={faSearch} className="text-white" />
        </div>
      </div>

      {/* 이미지 확대 모달 */}
      {isModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center"
          style={{ zIndex: 1050 }}
          onClick={closeModal}
        >
          <div
            className="position-relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageUrl}
              alt={alt}
              width={1200}
              height={800}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                width: 'auto',
                height: 'auto',
              }}
              className="rounded"
              unoptimized={
                imageUrl.startsWith('http') || imageUrl.startsWith('//')
              }
            />
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 bg-white rounded-circle p-2 m-2"
              onClick={closeModal}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}
    </>
  );
};

export default ThumbnailWidget;
