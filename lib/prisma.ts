import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// 싱글톤 패턴으로 PrismaClient 생성
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const adapter = new PrismaMariaDb(connectionString);

  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
};

// 전역 타입 선언
declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

// 싱글톤 인스턴스 관리
const prisma = globalThis.prismaInstance ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaInstance = prisma;
}

export default prisma;
