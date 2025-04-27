'use client';

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  ChangeEvent,
  Fragment,
} from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faUpload,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import { IUserProfile } from '@/types/user';
import { getFileExtension, isValidFileType } from '@/lib/util';
import { uploadAction, deleteFileAction } from '@/actions/auth/profile/upload';

export interface FileUploadPreviewRef {
  getUploadedImageUrls: () => string[];
  resetUploadState: () => void;
}

type FileUploadPreviewProps = {
  accept: string;
  label: string;
  maxFiles?: number; // 최대 파일 수 (선택적)
  maxSize?: number; // 최대 파일 크기 (MB 단위, 선택적)
  watch: any;
  register: any;
  errors: any;
  initialImages?: IUserProfile[]; // 초기 이미지 배열 추가
};

interface FilePreview {
  id: string;
  file?: File;
  preview: string;
  url: string;
  fileName: string;
  profileId?: string; // DB에 저장된 프로필 ID (기존 이미지용)
}

const FileUploadPreview = forwardRef<
  FileUploadPreviewRef,
  FileUploadPreviewProps
>(
  (
    {
      accept = 'image/*',
      label,
      maxFiles = 4,
      maxSize = 20,
      watch,
      register,
      errors,
      initialImages = [], // 기본값으로 빈 배열 설정
    },
    ref,
  ) => {
    const { t } = useLanguage();
    const { user, updateUserProfiles } = useAuth();
    const [files, setFiles] = useState<FilePreview[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>(
      {},
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    // 파일 크기 제한
    const maxSizeBytes = maxSize * 1024 * 1024; // MB를 바이트로 변환
    const staticUrl = process.env.NEXT_PUBLIC_HTTP_STATIC_URL || '';

    // 초기 이미지 로드
    useEffect(() => {
      if (initialImages && initialImages.length > 0) {
        const initialFilesPreviews = initialImages.map((image) => ({
          id: `existing-${image.uid}`,
          preview: `${staticUrl}${image.url}`,
          url: image.url,
          fileName: image.name,
          profileId: image.uid,
        }));
        setFiles(initialFilesPreviews);

        // initialImages가 변경될 때만 AuthContext 업데이트
        updateUserProfiles(initialImages);
      } else {
        setFiles([]);
        updateUserProfiles([]);
      }
    }, [initialImages, staticUrl, updateUserProfiles]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getUploadedImageUrls: () => {
        return files.map((file) => file.url);
      },
      resetUploadState: () => {
        setFiles([]);
      },
    }));

    const handleUploadClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
      try {
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;

        // 최대 파일 수 제한 확인
        if (files.length + selectedFiles.length > maxFiles) {
          const msg = t('common.upload.max_count', {
            max: maxFiles.toString(),
          });
          throw Error(msg);
        }

        //  파일 크기 계산
        let totalSize = 0;
        const newFiles = Array.from(selectedFiles);
        newFiles.forEach((file) => {
          totalSize += file.size;
        });
        if (totalSize > maxSizeBytes) {
          const msg = t('common.upload.max_size', {
            max: maxSize.toString(),
          });

          throw Error(msg);
        }

        setIsUploading(true);
        const frm = new FormData();
        const uid = watch('id');
        // frm.append(`idx`, idx)
        frm.append(`uid`, uid);

        Array.from(selectedFiles).forEach((file) => {
          if (!isValidFileType(file, accept)) {
            const fileExt = getFileExtension(file.name);
            const msg = t('common.upload.wrong_file', {
              extension: fileExt.toUpperCase(),
            });
            throw Error(msg);
          }
          frm.append(`file[]`, file);

          // FormData의 내용을 확인하는 방법
          for (const pair of frm.entries()) {
            console.log(
              `${pair[0]}: ${pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].size} bytes)` : pair[1]}`,
            );
          }

          // 파일 개수 확인
          let fileCount = 0;
          for (const entry of frm.entries()) {
            if (entry[0] === 'file[]') {
              fileCount++;
            }
          }
          console.log(`총 ${fileCount}개의 파일이 FormData에 추가됨`);
        });

        const response = await uploadAction(frm);
        console.log(response);
        if (
          response.status === 'success' &&
          response.data &&
          response.data.profileEntries
        ) {
          // 업로드된 파일들과 DB에 저장된 프로필 정보를 매핑
          const uploadedFiles = response.data.profileEntries.map(
            (profile: any, index: number) => {
              const fileInfo = response.data.files[index];
              return {
                id: `file-${Date.now()}-${index}`,
                preview: `${staticUrl}${fileInfo.fileUrl}`,
                url: fileInfo.fileUrl,
                fileName: fileInfo.fileName,
                profileId: profile.uid, // DB에 저장된 프로필 ID
              };
            },
          );

          const newFiles = [...files, ...uploadedFiles];
          setFiles(newFiles);

          // 파일 업로드 후 AuthContext 업데이트
          const newProfiles = newFiles.map((file) => ({
            uid: file.profileId || '',
            userId: user?.id || '',
            name: file.fileName,
            url: file.url,
          }));
          updateUserProfiles(newProfiles);

          const msg = t('common.upload.success');

          toast.success(msg || 'Upload successful');
        } else {
          throw Error(response.message || 'Upload failed');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        toast.error(errorMessage);

        // 파일 입력 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } finally {
        setIsUploading(false);
        // 파일 입력 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    const removeFile = async (id: string, profileId?: string) => {
      // 로컬 파일인 경우만 URL 객체 해제
      const fileToRemove = files.find((file) => file.id === id);
      if (fileToRemove && fileToRemove.file && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      // DB에 저장된 프로필이 있는 경우 삭제 처리
      if (profileId) {
        try {
          setIsDeleting((prev) => ({ ...prev, [id]: true }));
          const result = await deleteFileAction(profileId);
          if (result.status === 'success') {
            // 화면에서도 제거
            const newFiles = files.filter((file) => file.id !== id);
            setFiles(newFiles);

            // 파일 삭제 후 AuthContext 업데이트
            const newProfiles = newFiles.map((file) => ({
              uid: file.profileId || '',
              userId: user?.id || '',
              name: file.fileName,
              url: file.url,
            }));
            updateUserProfiles(newProfiles);

            toast.success(result.message || 'File deleted successfully');
          } else {
            toast.error(result.message || 'Failed to delete file');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          toast.error(errorMessage);
        } finally {
          setIsDeleting((prev) => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
          });
        }
      } else {
        // DB에 저장되지 않은 파일은 바로 화면에서 제거
        const newFiles = files.filter((file) => file.id !== id);
        setFiles(newFiles);

        // 파일 삭제 후 AuthContext 업데이트
        const newProfiles = newFiles.map((file) => ({
          uid: file.profileId || '',
          userId: user?.id || '',
          name: file.fileName,
          url: file.url,
        }));
        updateUserProfiles(newProfiles);
      }
    };

    return (
      <Fragment>
        <div className="mb-1">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleUploadClick}
            disabled={isUploading || files.length >= maxFiles}
          >
            {isUploading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faUpload} />
            )}{' '}
            {isUploading
              ? t('common.upload.uploading') || 'Uploading...'
              : t('common.upload.upload_btn')}
          </button>
          <input
            type="file"
            className="d-none"
            {...register(label)}
            ref={fileInputRef}
            accept={accept}
            multiple={maxFiles > 1}
            onChange={handleFileChange}
          />
          {errors[label]?.message && (
            <div className="invalid-feedback">{errors[label]?.message}</div>
          )}
          {files.length > 0 && (
            <small className="text-muted ms-2">
              {files.length}/{maxFiles}{' '}
              {t('common.upload.files_count') || 'files'}
            </small>
          )}
        </div>
        <div className="row g-2">
          {/* 미리보기 */}
          {files.map((file) => (
            <div className="col-6 col-md-3" key={file.id}>
              <div className="card h-100">
                <div className="position-relative" style={{ height: '150px' }}>
                  <Image
                    src={file.preview}
                    alt={file.fileName}
                    className="card-img-top"
                    width={100}
                    height={80}
                    style={{
                      objectFit: 'cover',
                      height: '100%',
                      width: '100%',
                    }}
                  />
                </div>
                <div className="card-footer p-2 d-flex justify-content-between align-items-center">
                  <small
                    className="text-muted text-truncate"
                    style={{ maxWidth: '70%' }}
                    title={file.fileName}
                  >
                    {file.fileName}
                  </small>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeFile(file.id, file.profileId)}
                    disabled={isDeleting[file.id]}
                  >
                    {isDeleting[file.id] ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faTrash} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Fragment>
    );
  },
);

FileUploadPreview.displayName = 'FileUploadPreview';

export default FileUploadPreview;
