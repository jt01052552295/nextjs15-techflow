'use server';

import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { UpdateTodosType, UpdateTodosSchema } from './schema';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

export const updateAction = async (data: UpdateTodosType) => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const validatedFields = UpdateTodosSchema(dictionary.common.form).safeParse(
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
    const {
      uid,
      cid,
      name,
      email,
      content,
      content2,
      gender,
      ipAddress,
      isUse,
      isVisible,
      todoFile,
      todoOption,
      deleteOptionUids,
      deleteFileUrls,
    } = validatedFields.data;

    // const now = dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')
    const now = dayjs(new Date().getTime()).toISOString();
    const unix = dayjs(new Date().getTime()).valueOf();

    const todo = await prisma.todos.findUnique({
      where: { uid, cid },
    });
    if (!todo) {
      const notExistuid = await __ts(
        'common.form.notExist',
        { column: uid },
        language,
      );
      throw Error(notExistuid);
    }

    let rs = null;

    rs = await prisma.$transaction(async (prisma) => {
      if (deleteOptionUids && deleteOptionUids.length > 0) {
        await prisma.todosOption.deleteMany({
          where: {
            uid: {
              in: deleteOptionUids,
            },
          },
        });
      }

      // ✅ 이미지 삭제 처리 (프론트에서 삭제한 것만)
      if (deleteFileUrls && deleteFileUrls.length > 0) {
        await prisma.todosFile.deleteMany({
          where: {
            todoId: uid,
            url: { in: deleteFileUrls }, // 이 URL 목록만 제거
          },
        });
      }

      const createData: any = {
        where: { uid },
        data: {
          name,
          email,
          gender,
          content,
          content2,
          ipAddress,
          isUse,
          isVisible,
          updatedAt: now,
        },
        include: {
          TodosComment: true,
          TodosFile: true,
          TodosOption: true,
        },
      };

      // ✅ 1. 현재 DB에 저장된 이미지 목록 조회
      const existingFiles = await prisma.todosFile.findMany({
        where: { todoId: uid },
        select: { url: true },
      });
      const existingUrls = existingFiles.map((file) => file.url);

      // ✅ 2. 새로 추가할 이미지만 필터링

      if (uid && todoFile && todoFile?.length > 0) {
        const newFiles = todoFile.filter(
          (file) => file.url && !existingUrls.includes(file.url),
        );

        const fileRecords = newFiles.map((file) => ({
          //todoId: uid,
          name: file.name,
          originalName: file.originalName, // ✅ 원본 파일명
          url: file.url,
          size: file.size, // ✅ 파일 크기
          ext: file.ext, // ✅ 확장자
          type: file.type, // ✅ MIME 타입
        }));
        createData.data.TodosFile = {
          create: fileRecords,
        };
      }

      if (todoOption && todoOption?.length > 0) {
        const updateOptionRecords = todoOption
          .filter(
            (
              option,
            ): option is {
              uid: string;
              name: string;
              age: number;
              gender: string;
            } => option.uid !== undefined,
          )
          .map((option) => ({
            where: { uid: option.uid },
            data: {
              name: option.name,
              age: option.age,
              gender: option.gender,
            },
          }));

        const createOptionRecords = todoOption
          .filter((option) => option.uid === undefined)
          .map((option) => ({
            name: option.name,
            age: option.age,
            gender: option.gender,
          }));

        createData.data.TodosOption = {
          update:
            updateOptionRecords.length > 0 ? updateOptionRecords : undefined,
          create:
            createOptionRecords.length > 0 ? createOptionRecords : undefined,
        };
      }

      const todo = await prisma.todos.update(createData);
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

  // revalidatePath(`/auth/login`)
  // 해당 /URL에 있던 캐시를 삭제하고 다시 생성해주는 함수인데 페이지를 다시 로드해주는 기능도 있음,
  // 새로고침이 아니라 차이점만 바꿔주는 새로고침
};
