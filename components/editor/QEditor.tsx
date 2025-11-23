// /home/techflow/admin/components/editor/QEditor.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react'; // useCallback 추가
import dynamic from 'next/dynamic';
import { editorUploadAction } from '@/actions/editor';
import 'react-quill/dist/quill.snow.css';
import styles from './QEditor.module.scss';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isValid?: boolean;
};

export default function QEditor({ value, onChange, error, isValid }: Props) {
  const [editor, setEditor] = useState<any>(null);

  const insertImage = (url: string) => {
    if (editor) {
      const range = editor.getSelection();
      if (range) {
        editor.insertEmbed(range.index, 'image', url);
      }
    }
  };

  const handleSelectionChange = (_range: any, _source: any, quill: any) => {
    // .getEditor() 제거, quill 인스턴스를 바로 사용
    if (quill && !editor) {
      setEditor(quill);
    }
  };

  // useCallback으로 imageHandler 감싸기
  const imageHandler = useCallback(() => {
    if (!editor) return; // editor가 설정되었는지 확인

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = async () => {
      if (!input.files?.length) return;

      const file = input.files[0];
      const formData = new FormData();
      formData.append('image', file);
      formData.append('domain', process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN || '');
      formData.append(
        'dir',
        new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      );

      try {
        const res = await editorUploadAction(formData);
        const fileUrl = res?.output?.[0]?.url;
        if (fileUrl) {
          insertImage(fileUrl);
        }
      } catch (err) {
        console.error('이미지 업로드 실패', err);
      }
    };
  }, [editor]); // editor를 의존성 배열에 추가

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler], // 의존성을 imageHandler로 변경
  );

  return (
    <div
      className={`${styles.editor} ${error ? 'is-invalid' : ''} ${isValid ? 'is-valid' : ''}`}
    >
      <ReactQuill
        value={value}
        onChange={onChange}
        onChangeSelection={handleSelectionChange}
        theme="snow"
        modules={modules}
      />
    </div>
  );
}
