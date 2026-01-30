export interface IPostResponse {
  uid: string;
  content: string;
  createdAt: string;
  author: IPostAuthor;
  images: IPostImage[];
  metrics: {
    likeCount: number;
    commentCount: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface IPostAuthor {
  id: string;
  username: string;
  name: string;
  nick: string | null;
  profileImage: string | null;
}

export interface IPostImage {
  uid: string;
  url: string;
  type: string | null;
}

// 요청 타입
export interface IPostCreateRequest {
  content: string;
  imageUrls?: string[];
  visibility?: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';
}

export interface IPostUpdateRequest {
  content?: string;
}

// 댓글 응답 타입
export interface ICommentResponse {
  uid: string;
  content: string;
  createdAt: string;
  author: IPostAuthor;
  depth: number;
  parentIdx: number | null;
  metrics: {
    likeCount: number;
    replyCount: number;
  };
  isLiked: boolean;
}

// 페이지네이션
export interface ICursorPagination<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
