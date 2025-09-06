'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import styles from './scss/ImageView.module.scss';

type ImageItem = {
  preview: string; // 서버 절대경로
  name: string;
};

type Props = {
  images: ImageItem[];
};

export default function ImageView({ images }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (images.length === 0) {
    return <div className="text-center text-muted">추가 정보가 없습니다.</div>;
  }

  const firstImage = images[0];
  const secondImage = images[1];
  const moreCount = images.length - 1;

  const slides = images.map((img) => ({
    src: img.preview,
  }));

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <div className={styles.galleryContainer} onClick={handleOpen}>
      {/* 첫 번째 이미지 */}
      <div className={styles.firstImage}>
        <Image
          src={firstImage.preview}
          alt={firstImage.name}
          fill
          className={styles.mainImage}
          unoptimized={process.env.NODE_ENV === 'development'}
        />
      </div>

      {/* 두 번째 이미지 + 오버레이 */}
      {moreCount > 0 && secondImage && (
        <div className={styles.secondImage}>
          <Image
            src={secondImage.preview}
            alt={secondImage.name}
            fill
            className={styles.overlayImage}
            unoptimized={process.env.NODE_ENV === 'development'}
          />
          <div className={styles.overlayText}>+{moreCount}</div>
        </div>
      )}

      {isOpen && (
        <Lightbox
          open={isOpen}
          close={() => setIsOpen(false)}
          slides={slides}
          plugins={[Counter, Thumbnails]}
          counter={{ container: { style: { top: 'unset', bottom: 0 } } }}
        />
      )}
    </div>
  );
}
