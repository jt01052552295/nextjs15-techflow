import { z } from 'zod';

export const CreateSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string(),
    bdTable: z.string().min(3, {
      message: messages.required,
    }),
    bdName: z.string().min(1, {
      message: messages.required,
    }),
    bdNameEn: z.string().optional(),
    bdNameJa: z.string().optional(),
    bdNameZh: z.string().optional(),
    bdSkin: z.string().optional(),
    bdSecret: z.boolean().optional(),
    bdPrivate: z.boolean().optional(),
    bdBusiness: z.boolean().optional(),
    bdUseCategory: z.boolean().optional(),
    bdCategoryList: z.string().optional(),
    bdFixTitle: z.string().optional(),
    bdListSize: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    bdFileCount: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    bdNewTime: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    bdListLevel: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    bdReadLevel: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    bdWriteLevel: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    bdReplyLevel: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    bdCommentLevel: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    bdUploadLevel: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    bdDownloadLevel: z.preprocess(
      (val) => parseInt(val as string, 10),
      z.number().optional(),
    ),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  });

export type CreateType = z.infer<ReturnType<typeof CreateSchema>>;
