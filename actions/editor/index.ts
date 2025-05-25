'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

type UploadReturnType = {
  status: string;
  message: string;
  output?: any;
};

export const editorUploadAction = async (
  data: FormData,
): Promise<UploadReturnType> => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const serialized = Object.fromEntries(data);
  const date = dayjs(new Date().getTime()).format('YYYYMMDD');

  const files = data.getAll('image') as File[];

  if (files.length === 0) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const fileInfos = await Promise.all(
    files.map(async (file, index) => {
      const uid = uuidv4();

      if (!process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN) {
        throw new Error('NEXT_PUBLIC_STATIC_SUBDOMAIN is not defined');
      }

      const subdmoain = process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN;
      const date = dayjs(new Date().getTime()).format('YYYYMMDD');

      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('domain', subdmoain);
        formData.append('dir', date);

        // console.log([...formData.entries()])

        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STATIC_EDITOR_URL}`,
          {
            method: 'POST',
            body: formData,
            headers: {
              Accept: 'application/json',
            },
          },
        );

        if (uploadResponse.ok) {
          const responseData = await uploadResponse.json();
          console.log(responseData);

          return responseData.files.map((fileInfo: any) => ({
            url: process.env.NEXT_PUBLIC_STATIC_URL + fileInfo.fileUrl,
          }));
        } else {
          const errorText = await uploadResponse.text();
          console.error(
            `Upload failed with status: ${uploadResponse.status}, message: ${errorText}`,
          );
          throw new Error(dictionary.common.upload_error);
        }
      } catch (error) {
        console.error('업로드 에러:', error);
        throw new Error(dictionary.common.upload_error);
      }
    }),
  );

  const flattenedFileInfos = fileInfos.flat();
  return {
    status: 'success',
    message: 'upload ok!',
    output: flattenedFileInfos,
  };
};
