'use client';

import { useRef, useState, useEffect } from 'react';
import styles from './scss/ImageUploader.module.scss';
import Image from 'next/image';
import { imageUploadAction } from '@/actions/upload/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/components/context/LanguageContext';
import { toast } from 'sonner';
type UploadedImage = {
  preview: string;
  name: string; // ✅ 파일명
  url: string; // ✅ 서버 저장된 URL
};

type Props = {
  dir: string; // 기능별 폴더명
  pid: string; // 원본글 UID
  onChange: (images: UploadedImage[], removed?: string[]) => void;
  initialImages?: UploadedImage[];
  mode?: 'create' | 'edit'; // ✅ 작성/수정 모드 구분
};

const MAX_FILES = 1; // ✅ 최대 업로드 개수
const MAX_FILE_SIZE = 2 * 1024 * 1024; // ✅ 2MB 제한

export default function ImageUploader({
  dir,
  pid,
  onChange,
  initialImages = [],
  mode = 'create', // 기본값: 작성모드
}: Props) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialImages.length > 0) {
      setImages(initialImages);
    }
  }, [initialImages]);

  // ✅ 부모에게 현재 이미지 상태 전달
  const notifyParent = (
    currentImages: UploadedImage[],
    removed: string[] = [],
  ) => {
    setTimeout(() => {
      if (mode === 'edit') {
        onChange(currentImages, removed);
      } else {
        onChange(currentImages);
      }
    }, 0); // ✅ defer 처리
  };
  const uploadFiles = async (files: File[]) => {
    // ✅ 현재 업로드된 이미지 + 새로 추가될 이미지 개수 체크
    if (images.length + files.length > MAX_FILES) {
      toast.error(t('common.upload.max_count', { max: MAX_FILES }));
      return;
    }

    const formData = new FormData();
    let validFileCount = 0;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          t('common.upload.over_size', { name: file.name, max: MAX_FILE_SIZE }),
        );
        continue; // ✅ 용량 초과 파일 건너뜀
      }
      formData.append('image[]', file); // ✅ 여러 파일을 한번에 추가
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
        result.files?.length > 0
      ) {
        const newImages = result.files.map((file) => ({
          preview: process.env.NEXT_PUBLIC_STATIC_URL + file.fileUrl,
          name: file.fileName,
          originalName: file.originalName,
          size: file.size,
          ext: file.ext,
          type: file.type,
          url: file.fileUrl,
        }));

        console.log(newImages);

        setImages((prev) => {
          const updated = [...prev, ...newImages];
          notifyParent(updated, removedImages); // ✅ 부모에 상태 전달
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
    const files = Array.from(e.target.files || []);
    uploadFiles(files); // ✅ 여러 파일을 한번에 업로드
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files); // ✅ 드래그&드롭 시도도 동일 처리
  };

  const handleRemove = (index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);

      let updatedRemovedImages = removedImages;

      // ✅ 수정 모드일 때 삭제 목록 관리
      if (mode === 'edit' && removed.url) {
        updatedRemovedImages = [...removedImages, removed.url];
        setRemovedImages(updatedRemovedImages);
      }

      const updated = prev.filter((_, i) => i !== index);

      // ✅ 삭제 목록까지 부모에 전달
      notifyParent(updated, updatedRemovedImages);

      return updated;
    });
  };

  return (
    <div
      className={styles.uploaderWrapper}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className={styles.previewContainer}>
        {images.map((img, i) => (
          <div key={i} className={styles.thumbnail}>
            <Image
              src={img.preview}
              alt={`preview-${i}`}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized={process.env.NODE_ENV === 'development'}
            />
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => handleRemove(i)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}

        {/* ✅ 업로드 버튼: 최대 개수 도달 시 비활성화 */}
        {images.length < MAX_FILES && (
          <div
            className={styles.thumbnail + ' ' + styles.uploadBox}
            onClick={() => inputRef.current?.click()}
          >
            <FontAwesomeIcon icon={faPlus} />
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              ref={inputRef}
              onChange={handleSelect}
            />
          </div>
        )}
      </div>
      {isUploading && <p>{t('common.upload.uploading')}</p>}
    </div>
  );
}
