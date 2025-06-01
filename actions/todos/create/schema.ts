import { z } from 'zod';

export const FileDetailsSchema = z.object({
  idx: z.number().optional(),
  uid: z.string().optional(),
  todoId: z.string().optional(),
  name: z.string().optional(),
  url: z.string().optional(),
  previewUrl: z.string().optional(),
});

export const OptionDetailsSchema = (messages: Record<string, any>) =>
  z.object({
    idx: z.number().optional(),
    uid: z.string().optional(),
    todoId: z.string().optional(),
    name: z.string().trim().min(1, {
      message: messages.required,
    }),
    age: z.coerce.number().min(0, {
      message: messages.numeric,
    }),
    gender: z.string().min(1, {
      message: messages.required,
    }),
    _delete: z.boolean().optional(),
  });

export const CreateTodosSchema = (messages: Record<string, any>) =>
  z.object({
    uid: z.string(),
    name: z.string().min(3, {
      message: messages.required,
    }),
    email: z.string().email({
      message: messages.required,
    }),
    gender: z.string().optional(),
    img1: z.string().optional(),
    content: z.string().optional().nullable(),
    content2: z.string().optional().nullable(),
    ipAddress: z.string().optional(),
    isUse: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    todoFile: z.array(FileDetailsSchema).optional(),
    todoOption: z.array(OptionDetailsSchema(messages)).optional(),
  });

export type CreateTodosType = z.infer<ReturnType<typeof CreateTodosSchema>>;
