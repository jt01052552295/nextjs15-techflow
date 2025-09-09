import { IUserMini } from '@/types/user';

export interface ITodos {
  idx: number;
  uid: string;
  cid: string;
  name: string;
  email: string;
  gender?: string | null;
  img1?: string | null;
  content?: string | null;
  content2?: string | null;
  password?: string | null;
  ipAddress?: string | null;
  sortOrder: number;
  createdAt: Date; // JavaScript Date 객체로 처리
  updatedAt: Date;
  isUse: boolean;
  isVisible: boolean;
  TodosComment: ITodosComment[]; // 관계된 댓글
  TodosFile: ITodosFile[]; // 관계된 파일
  TodosOption: ITodosOption[]; // 관계된 파일
}
export type ITodosPart = Partial<ITodos>;

export type ITodosCounts = {
  TodosComment: number;
  TodosFile: number;
  TodosOption: number;
};

export type ITodosListRow = ITodos & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
  _count: ITodosCounts;
};

export interface ITodosComment {
  idx: number;
  uid: string;
  parentIdx: number | null;
  todoId: string;
  author: string;
  content: string;
  content2: string;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  replyCount: number;
  user?: IUserMini;
  isMine?: boolean;
  isLiked?: boolean;
}

export type ITodosCommentRow = ITodosComment & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
};

export type ITodosCommentPart = Partial<ITodosComment>;

export interface ITodosCommentLike {
  idx: number;
  commentId: number;
  userId: string;
  createdAt: Date;
}
export type ITodosCommentLikePart = Partial<ITodosCommentLike>;

export interface ITodosFile {
  idx: number;
  uid: string;
  todoId: string;
  name: string;
  originalName: string; // ✅ 유저가 업로드한 원본 파일명
  url: string; // 서버 저장 URL
  size: number; // ✅ 파일 크기 (bytes)
  ext: string; // ✅ 확장자명 (pdf, zip, jpg 등)
  type: string; // ✅ MIME 타입 (application/pdf, image/png 등)
  createdAt: Date; // ✅ 업로드 시각 (ISO string)
  updatedAt: Date; // ✅ 수정 시각 (ISO string)
}

export type ITodosFileWithoutIDX = Omit<ITodosFile, 'idx'>;
// export type ITodosFilePart = Partial<ITodosFile>
export interface ITodosFileWithPreview extends ITodosFile {
  previewUrl?: string;
}
export type ITodosFilePart = Partial<ITodosFileWithPreview>;

export interface ITodosOption {
  idx: number;
  uid: string;
  name: string;
  age: number;
  gender: string;
  todoId: string;
}

export type IITodosOptionWithoutIDX = Omit<ITodosOption, 'idx'>;
export type ITodosOptionPart = Partial<ITodosOption>;

export type OrderField =
  | 'sortOrder'
  | 'name'
  | 'email'
  | 'createdAt'
  | 'updatedAt';
export type OrderDirection = 'asc' | 'desc';

export type ITodosFilterType = {
  name?: string;
  email: string;
  dateType?: string;
  startDate?: string;
  endDate?: string;
  orderBy?: OrderField;
  order?: OrderDirection;
};
