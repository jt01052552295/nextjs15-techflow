import { IUser } from '@/types/user';
import { IBoard } from '@/types/board';
import { IBBS } from '@/types/bbs';

export interface IBBSComment {
  idx: number;
  uid: string;
  bdTable: string;
  pid: string;
  author?: string | null;
  password?: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isUse: boolean;
  isVisible: boolean;
  parentIdx?: number | null;
  likeCount: number;
  replyCount: number;
  isUser: boolean;
  board: IBoard;
  bbs: IBBS;
  user?: IUser;
  parent?: IBBSComment | null;
  replies: IBBSComment[];
  likes: IBBSCommentLike[];
  isMine?: boolean;
  isLiked?: boolean;
}

export type IBBSCommentRow = IBBSComment & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
};

export interface IBBSCommentLike {
  idx: number;
  parentIdx: number;
  userId: string;
  createdAt: Date;
  user?: IUser;
  comment?: IBBSComment;
}
