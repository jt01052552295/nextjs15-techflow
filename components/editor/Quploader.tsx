'use client';

import { editorUploadAction } from '@/actions/editor';
import { useState, useRef, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

interface FormInputProps {
  label: string;
  errors: any;
  setValue?: any;
  value?: any;
}

function Quploader({ label, errors, setValue, value }: FormInputProps) {
  const [content, setContent] = useState('');
  //   const { locale, dictionary } = useLanguage();

  if (!process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN) {
    throw new Error('NEXT_PUBLIC_STATIC_SUBDOMAIN is not defined');
  }

  const quillRef = useRef<ReactQuill>(null);
  const subdmoain = process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN;
  const date = dayjs(new Date().getTime()).format('YYYYMMDD');

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.addEventListener('change', async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('domain', subdmoain);
        formData.append('dir', date);

        try {
          // for (const pair of formData.entries()) {
          //   console.log(pair[0], pair[1])
          // }

          const response = await editorUploadAction(formData);
          console.log(response);
          if (response.status == 'success' && response.output) {
            const serverOutput = response.output;

            serverOutput.map((file: any) => {
              if (quillRef.current) {
                const editor = quillRef.current.getEditor();
                const range = editor.getSelection();
                if (range) {
                  editor.insertEmbed(range.index, 'image', file.url);
                }
              }
            });
          } else {
            throw Error(response.message);
          }
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  const handleContentChange = (content: any) => {
    setContent(content);
    setValue(label, content);

    // if (errors[label]?.message) {
    //     console.error(errors)
    // }
  };

  useEffect(() => {
    if (value) {
      setContent(value);
      setValue(label, value);
    }

    // if (errors) {
    //     console.error(errors)
    // }

    // if (errors[label]?.message) {
    //     console.error(errors)
    // }
  }, [value, errors, label, setValue]);

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
      ref={quillRef}
      modules={modules}
      formats={formats}
      theme="snow"
      className={`${errors[label] && 'is-invalid'}`}
      value={content}
      onChange={handleContentChange}
    />
  );
}

export default Quploader;
