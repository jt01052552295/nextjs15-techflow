export type RoutePattern = string;

export type RouteMetadata = {
  name: string;
  desc: string;
  isPublic?: boolean;
  roles?: string[];
};

// 라우트 데이터의 구조를 정확히 반영하는 타입
export type RoutesDataType = {
  [key: string]: {
    [key: string]: RoutePattern;
  };
};
