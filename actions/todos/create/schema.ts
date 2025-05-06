import { z } from 'zod';

export const FileDetailsSchema = z.object({
  idx: z.number().optional(),
  uid: z.string().optional(),
  todoId: z.string().optional(),
  name: z.string().optional(),
  url: z.string().optional(),
});

export const OptionDetailsSchema = z.object({
  idx: z.number().optional(),
  uid: z.string().optional(),
  todoId: z.string().optional(),
  name: z.string().optional(),
  age: z.number().optional(),
  gender: z.string().optional(),
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
    todoOption: z.array(OptionDetailsSchema).optional(),
  });

export type CreateTodosType = z.infer<ReturnType<typeof CreateTodosSchema>>;
