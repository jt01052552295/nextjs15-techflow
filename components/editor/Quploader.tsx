'use client';

import { editorUploadAction } from '@/actions/editor';
import { useState, useEffect, useMemo } from 'react';
import { UseFormSetValue, FieldValues } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

interface FormInputProps<T extends FieldValues> {
  label: keyof T;
  errors: any;
  setValue: UseFormSetValue<T>;
  value?: any;
}

function Quploader<T extends FieldValues>({
  label,
  errors,
  setValue,
  value,
}: FormInputProps<T>) {
  const [content, setContent] = useState('');
  const [editor, setEditor] = useState<any>(null);
  const subdomain = process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN ?? '';
  const date = dayjs(new Date().getTime()).format('YYYYMMDD');

  if (!subdomain) {
    throw new Error('NEXT_PUBLIC_STATIC_SUBDOMAIN is not defined');
  }

  const uploadImageToEditor = async (
    file: File,
    editor: any,
    insertPosition: number,
  ) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('domain', subdomain);
    formData.append('dir', date);

    try {
      const response = await editorUploadAction(formData);
      if (response.status === 'success' && response.output) {
        response.output.forEach((file: any) => {
          editor.insertEmbed(insertPosition, 'image', file.url);
        });
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
    }
  };

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      if (!input.files?.length) return;

      const file = input.files[0];
      const range = editor?.getSelection();
      if (range) {
        await uploadImageToEditor(file, range.index);
      }
    };
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    setValue(label, val);
  };

  useEffect(() => {
    if (value !== undefined && content !== value) {
      setContent(value);
    }
  }, [value]);

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ header: '1' }, { header: '2' }, { font: [] }],
          [{ align: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
          ],
          [
            {
              color: [],
            },
            { background: [] },
          ],
          ['link', 'image', 'video'],
        ],
        handlers: { image: imageHandler },
        clipboard: {
          matchVisual: false,
        },
      },
    };
  }, []);

  const formats = [
    'font',
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'align',
    'color',
    'background',
    'size',
    'h1',
    'image',
    'video',
  ];

  return (
    <ReactQuill
      value={content}
      onChange={handleContentChange}
      onEditorCreated={setEditor} // ✅ 여기서 에디터 인스턴스를 받음
      modules={modules}
      formats={formats}
      theme="snow"
      className={errors[label] ? 'is-invalid' : ''}
    />
  );
}

export default Quploader;
