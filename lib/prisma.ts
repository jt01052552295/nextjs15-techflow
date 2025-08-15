import { PrismaClient } from '@prisma/client';

// 싱글톤 패턴 함수
const prismaClientSingleton = () => {
  // 로깅 옵션을 사용하여 PrismaClient 생성
  return new PrismaClient({
    log:
      process.env.NODE_ENV !== 'production'
        ? [
            {
              emit: 'event',
              level: 'query',
            },
            'info',
            'warn',
            'error',
          ]
        : [],
  });
};

// Next.js를 위한 전역 타입 정의
declare global {
  var prisma: PrismaClient | undefined;
}

// 전역에 저장된 prisma 인스턴스 사용 또는 새로 생성
const prisma = global.prisma || prismaClientSingleton();

// 개발 환경에서 이벤트 리스너 추가
if (process.env.NODE_ENV !== 'production') {
  // 타입 단언 사용 - Prisma의 타입 시스템 제한 때문
  (prisma as any).$on('query', (e: any) => {
    console.log('SQL:');
    console.log('Query:', e.query);
    console.log('Params:', e.params);
    console.log('Duration:', e.duration, 'ms');
    console.log('-----------------------------------');
  });

  global.prisma = prisma;
}

export default prisma;
