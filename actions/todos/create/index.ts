'use server';

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { CreateTodosType, CreateTodosSchema } from './schema';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

export const createAction = async (data: CreateTodosType) => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const validatedFields = CreateTodosSchema(dictionary.common.form).safeParse(
    data,
  );
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  try {
    // throw Error('throw test')
    // const uid = uuidv4()
    const {
      uid,
      name,
      email,
      content,
      content2,
      gender,
      ipAddress,
      todoFile,
      todoOption,
    } = validatedFields.data;

    // const now = dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
    // const now = dayjs(new Date().getTime()).toISOString();
    // const unix = dayjs(new Date().getTime()).valueOf();
    const cookieStore = await cookies();
    const hasCookie = cookieStore.has('user-ip');
    let cookie;
    if (!hasCookie) {
      const oneDay = 24 * 60 * 60 * 1000;
      cookieStore.set('user-ip', ipAddress as string, {
        expires: Date.now() + oneDay,
      });
    } else {
      // cookies().delete('user-ip')
      cookie = cookieStore.get('user-ip')?.value;
    }

    const todo = await prisma.todos.findUnique({
      where: { uid },
    });
    if (todo) {
      const alreadyUseuid = await __ts(
        'common.form.alreadyUse',
        { column: uid },
        language,
      );
      throw Error(alreadyUseuid);
    }

    let rs = null;
    const hashedPassword = await bcrypt.hash('1111', 10);

    rs = await prisma.$transaction(async (prisma) => {
      const createData: any = {
        data: {
          uid,
          name,
          email,
          gender,
          content,
          content2,
          ipAddress,
          password: hashedPassword,
          isUse: true,
          isVisible: true,
        },
        include: {
          TodosComment: true,
          TodosFile: true,
          TodosOption: true,
        },
      };

      if (uid && todoFile && todoFile?.length > 0) {
        const fileRecords = todoFile
          .filter(
            (file): file is { name: string; url: string } =>
              file.name !== undefined && file.url !== undefined,
          )
          .map((file: { name: string; url: string }) => ({
            //todoId: uid,
            name: file.name,
            url: file.url,
          }));
        createData.data.TodosFile = {
          create: fileRecords,
        };
      }

      if (todoOption && todoOption?.length > 0) {
        const optionRecords = todoOption
          .filter(
            (option): option is { name: string; age: number; gender: string } =>
              option.name !== undefined &&
              option.age !== undefined &&
              option.gender !== undefined,
          )
          .map((option: { name: string; age: number; gender: string }) => ({
            //todoId: uid,
            name: option.name,
            age: option.age,
            gender: option.gender,
          }));
        createData.data.TodosOption = {
          create: optionRecords,
        };
      }

      const todo = await prisma.todos.create(createData);
      return todo;
    });

    const save_success = await __ts('common.save_success', {}, language);

    return {
      status: 'success',
      message: save_success,
      data: rs,
    };
  } catch (error: any) {
    // console.error 는 터미널창 확인,
    // return error는 브라우저로 전달
    console.error(error);
    const save_failed = await __ts('common.save_failed', {}, language);
    return {
      status: 'error',
      error: error.message,
      message: save_failed,
    };
  }
};
