import { PrismaClient } from '@prisma/client';

// 싱글톤 패턴으로 PrismaClient 생성
const prismaClientSingleton = () => new PrismaClient();

// 전역 타입 선언
declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// 싱글톤 인스턴스 관리
const prisma = globalThis.prisma ?? prismaClientSingleton();
if (!globalThis.prisma) globalThis.prisma = prisma;

export default prisma;
