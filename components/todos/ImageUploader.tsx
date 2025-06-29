'use client';

import { useRef, useState } from 'react';
import styles from './scss/ImageUploader.module.scss';
import Image from 'next/image';

type ImageFile = {
  file: File;
  preview: string;
};

export default function ImageUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageFile[]>([]);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

    setImages((prev) => [...prev, ...imageFiles]);
  };

  const handleRemove = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

    setImages((prev) => [...prev, ...imageFiles]);
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
            />
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => handleRemove(i)}
            >
              ✕
            </button>
          </div>
        ))}

        {/* 업로드 버튼 (빈 슬롯처럼 보이게) */}
        <div
          className={styles.thumbnail + ' ' + styles.uploadBox}
          onClick={() => inputRef.current?.click()}
        >
          +
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            ref={inputRef}
            onChange={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}
