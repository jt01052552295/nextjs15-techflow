'use client';

import React, { useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import type ReactQuillType from 'react-quill';
import { editorUploadAction } from '@/actions/editor';
import 'react-quill/dist/quill.snow.css';
import styles from './QEditor.module.scss';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function QEditor({ value, onChange, error }: Props) {
  const quillRef = useRef<ReactQuillType | null>(null);
  const [editor, setEditor] = useState<any>(null);

  const insertImage = (url: string) => {
    if (!quillRef.current) return;
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection();
      if (range) {
        editor.insertEmbed(range.index, 'image', url);
      }
    }
  };

  const handleSelectionChange = (_range: any, quill: any) => {
    if (!editor && quill) setEditor(quill);
  };

  const imageHandler = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = async () => {
      if (!input.files?.length || !editor) return;

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
        console.log(res);
        const fileUrl = res?.output?.[0]?.url;
        if (fileUrl) {
          insertImage(fileUrl);
        }
      } catch (err) {
        console.error('이미지 업로드 실패', err);
      }
    };
  };

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
    [editor],
  );

  return (
    <div className={`${styles.editor} ${error ? 'is-invalid' : ''}`}>
      <ReactQuill
        ref={quillRef as any}
        value={value}
        onChange={onChange}
        onChangeSelection={handleSelectionChange} // ✅ 여기서 editor 추출
        theme="snow"
        modules={modules}
      />
    </div>
  );
}
