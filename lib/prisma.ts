import { PrismaClient, Prisma } from '@prisma/client';

// 1) 옵션에 query 이벤트 방출 켜기
const prismaClientSingleton = () =>
  new PrismaClient({
    log: [{ level: 'query', emit: 'event' }],
  });

// 2) 전역 타입을 "생성 함수의 반환 타입"으로 보존
declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// 3) 싱글톤
const prisma = globalThis.prisma ?? prismaClientSingleton();
if (!globalThis.prisma) globalThis.prisma = prisma;

// 4) 해당 구간만 쿼리 캡처 유틸
export type QueryLog = { query: string; params: string; duration: number };

let CAPTURE = false;
let BUFFER: QueryLog[] = [];
let FILTER: ((e: Prisma.QueryEvent) => boolean) | null = null;

// 전역 리스너 (옵션 보존으로 'query'가 정상 인식됨)
prisma.$on('query', (e) => {
  if (!CAPTURE) return;
  if (FILTER && !FILTER(e)) return;
  BUFFER.push({ query: e.query, params: e.params, duration: e.duration });
});

export async function captureQueries<T>(
  fn: () => Promise<T>,
  opts?: { filter?: (e: Prisma.QueryEvent) => boolean },
): Promise<{ result: T; logs: QueryLog[] }> {
  const prevCapture = CAPTURE;
  const prevFilter = FILTER;
  CAPTURE = true;
  FILTER = opts?.filter ?? null;
  BUFFER = [];
  try {
    const result = await fn();
    return { result, logs: [...BUFFER] };
  } finally {
    CAPTURE = prevCapture;
    FILTER = prevFilter;
    BUFFER = [];
  }
}

export default prisma;
