import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// 싱글톤 패턴으로 PrismaClient 생성
const prismaClientSingleton = () => {
  // MariaDB 어댑터 생성 (MySQL과 호환)
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const adapter = new PrismaMariaDb(connectionString);

  return new PrismaClient({ adapter });
};

// 전역 타입 선언
declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// 싱글톤 인스턴스 관리
const prisma = globalThis.prisma ?? prismaClientSingleton();
if (!globalThis.prisma) globalThis.prisma = prisma;

export default prisma;
