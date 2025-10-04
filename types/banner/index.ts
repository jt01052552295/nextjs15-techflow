export interface IBanner {
  idx: number;
  uid: string;
  cid: string;
  gubun: string;
  title: string;
  url: string;
  sortOrder: number;
  deviceType: string;
  createdAt: Date;
  updatedAt: Date;
  isUse: boolean;
  isVisible: boolean;
  BannerFile: IBannerFile[]; // 관계된 파일
}
export type IBannerPart = Partial<IBanner>;

export type IBannerListRow = IBanner & {
  createdAt: string; // DTO에서 ISO 문자열로 변환
  updatedAt: string; // DTO에서 ISO 문자열로 변환
};

export type ListEditCell = 'gubun' | 'title';

export interface IBannerFile {
  idx: number;
  uid: string;
  bannerId: string;
  name: string;
  originalName: string; // ✅ 유저가 업로드한 원본 파일명
  url: string; // 서버 저장 URL
  size: number; // ✅ 파일 크기 (bytes)
  ext: string; // ✅ 확장자명 (pdf, zip, jpg 등)
  type: string; // ✅ MIME 타입 (application/pdf, image/png 등)
  createdAt: Date; // ✅ 업로드 시각 (ISO string)
  updatedAt: Date; // ✅ 수정 시각 (ISO string)
}

export type IBannerFileWithoutIDX = Omit<IBannerFile, 'idx'>;
export interface IBannerFileWithPreview extends IBannerFile {
  previewUrl?: string;
}
export type IBannerFilePart = Partial<IBannerFileWithPreview>;

export type SortBy = 'idx' | 'gubun' | 'createdAt' | 'updatedAt' | 'sortOrder';

export type SortOrder = 'asc' | 'desc';

export type ListParams = {
  q?: string;
  gubun?: string;
  dateType?: 'createdAt' | 'updatedAt';
  startDate?: string;
  endDate?: string;

  isUse?: boolean;
  isVisible?: boolean;

  sortBy?: SortBy; // 기본: 'createdAt'
  order?: SortOrder; // 기본: 'desc'

  /** 커서 기반 페이지네이션 */
  limit?: number; // 기본 20 (1~100)
  /**
   * 커서 토큰(JSON을 base64url로 인코드한 문자열)
   * 구조: { sortValue: any; idx: number }
   * 예) sortBy='createdAt' → { sortValue: '2025-08-01T12:34:56.000Z', idx: 12345 }
   */
  cursor?: string | null;
};

export type ListResult<T = IBanner> = {
  items: T[];
  nextCursor?: string;
  totalAll: number;
  totalFiltered: number;
};

export type DeleteInput = {
  uid?: string;
  uids?: string[];
  hard?: boolean; // 기본 false(소프트 삭제)
};

export type DeleteResult = {
  mode: 'single' | 'bulk';
  affected: number; // 업데이트(soft) or 삭제(hard)된 개수
};
