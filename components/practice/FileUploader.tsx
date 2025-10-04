'use client';

import React, { useRef, useState, useEffect } from 'react';
import styles from './scss/FileUploader.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { imageUploadAction } from '@/actions/upload/image';
import { useLanguage } from '@/components/context/LanguageContext';
import { toast } from 'sonner';
type UploadedFile = {
  name: string; // 서버 저장 파일명
  originalName: string; // 업로드한 원본 이름
  size: number; // 파일 크기 (bytes)
  ext: string; // 확장자명
  type: string; // MIME 타입
  url: string; // 서버 저장 URL
};

type Props = {
  dir: string; // 기능별 폴더명
  pid: string; // 원본글 UID
  onChange: (files: UploadedFile[], removed?: string[]) => void;
  initialFiles?: UploadedFile[];
  mode?: 'create' | 'edit'; // 작성/수정 구분
};

const MAX_FILES = 4;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB 제한

export default function FileUploader({
  dir,
  pid,
  onChange,
  initialFiles = [],
  mode = 'create',
}: Props) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialFiles.length > 0) {
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  // 부모에 상태 전달
  const notifyParent = (
    currentFiles: UploadedFile[],
    removed: string[] = [],
  ) => {
    setTimeout(() => {
      if (mode === 'edit') {
        onChange(currentFiles, removed);
      } else {
        onChange(currentFiles);
      }
    }, 0);
  };

  // console.log(initialFiles);

  const uploadFiles = async (selectedFiles: File[]) => {
    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.error(t('common.upload.max_count', { max: MAX_FILES }));
      return;
    }

    const formData = new FormData();
    let validFileCount = 0;

    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          t('common.upload.over_size', { name: file.name, max: MAX_FILE_SIZE }),
        );
        continue;
      }
      formData.append('image[]', file);
      validFileCount++;
    }

    if (validFileCount === 0) {
      toast.error(t('common.upload.no_file'));
      return;
    }

    formData.append('domain', process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN!);
    formData.append('dir', dir);
    formData.append('pid', pid);

    try {
      setIsUploading(true);

      const result = await imageUploadAction(formData, dir, pid);

      if (
        result.status === 'success' &&
        Array.isArray(result.files) &&
        result.files.length > 0
      ) {
        const newFiles = result.files.map((file) => ({
          name: file.fileName,
          originalName: file.originalName,
          size: file.size,
          ext: file.ext,
          type: file.type,
          url: file.fileUrl,
        }));

        setFiles((prev) => {
          const updated = [...prev, ...newFiles];
          notifyParent(updated, removedFiles);
          return updated;
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('업로드 에러:', error);
      toast.error(t('common.upload.error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    uploadFiles(selectedFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    uploadFiles(droppedFiles);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => {
      const removed = prev[index];
      if (mode === 'edit' && removed.url) {
        setRemovedFiles((prevRemoved) => [...prevRemoved, removed.url]);
      }
      const updated = prev.filter((_, i) => i !== index);
      notifyParent(updated, removedFiles);
      return updated;
    });
  };

  return (
    <div
      className={styles.uploader}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
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
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => handleRemove(i)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      {/* 업로드 버튼 */}
      {files.length < MAX_FILES && (
        <div
          className={styles.uploadBox}
          onClick={() => inputRef.current?.click()}
        >
          <FontAwesomeIcon icon={faPlus} /> {t('common.upload.label')}
          <input
            type="file"
            multiple
            hidden
            ref={inputRef}
            onChange={handleSelect}
          />
        </div>
      )}

      {isUploading && <p>{t('common.upload.uploading')}</p>}
    </div>
  );
}
