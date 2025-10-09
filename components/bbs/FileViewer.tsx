'use client';

import React from 'react';
import styles from './scss/FileUploader.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/components/context/LanguageContext';

type ViewerFile = {
  name: string; // 서버 저장 파일명
  originalName: string; // 업로드한 원본 이름
  size: number; // 파일 크기 (bytes)
  ext: string; // 확장자명
  type: string; // MIME 타입
  url: string; // 서버 저장 URL
};

type Props = {
  files: ViewerFile[];
};

export default function FileViewer({ files = [] }: Props) {
  const { t } = useLanguage();

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={styles.uploader}>
      <div className={styles.fileList}>
        {files.map((file, i) => (
          <div key={i} className={styles.fileItem}>
            <FontAwesomeIcon icon={faFileAlt} className={styles.fileIcon} />
            <span
              className={styles.fileName}
              onClick={() => {
                const link = document.createElement('a');
                link.href = process.env.NEXT_PUBLIC_STATIC_URL + file.url; // ✅ 절대 경로
                link.download = file.originalName || file.name; // ✅ 다운로드시 원본명 유지
                link.target = '_blank';
                link.click();
              }}
            >
              {file.originalName}
            </span>
            <span className={styles.fileSize}>
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
