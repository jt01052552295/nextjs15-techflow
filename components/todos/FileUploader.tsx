'use client';

import React, { useRef, useState } from 'react';
import styles from './scss/FileUploader.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faTimes } from '@fortawesome/free-solid-svg-icons';

interface FileItem {
  file: File;
  name: string;
  size: number;
}

export default function FileUploader() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles).map((file) => ({
      file,
      name: file.name,
      size: file.size,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles) return;

    const newFiles = Array.from(droppedFiles).map((file) => ({
      file,
      name: file.name,
      size: file.size,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  return (
    <div
      className={styles.uploader}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className={styles.fileList}>
        {files.map((fileItem, i) => (
          <div key={i} className={styles.fileItem}>
            <FontAwesomeIcon icon={faFileAlt} className={styles.fileIcon} />
            <span className={styles.fileName}>{fileItem.name}</span>
            <span className={styles.fileSize}>
              ({(fileItem.size / 1024).toFixed(1)} KB)
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

      <div
        className={styles.uploadBox}
        onClick={() => inputRef.current?.click()}
      >
        + 파일 업로드
        <input
          type="file"
          multiple
          hidden
          ref={inputRef}
          onChange={handleSelect}
        />
      </div>
    </div>
  );
}
