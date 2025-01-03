import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

// const prisma =
//     global.prisma ||
//     new PrismaClient({
//         log: ['query', 'info', 'warn', 'error'], // SQL 쿼리 로그 활성화
//     })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
