import prisma from '@/lib/prisma';

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  } catch (error) {
    console.log('Error fetching user:', error);

    return null;
  }
};

export const getUserByPhone = async (phone: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        phone,
        isUse: true,
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
        isUse: true,
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await prisma.account.findFirst({
      where: { userId },
    });

    return account;
  } catch {
    return null;
  }
};

export const getUsers = async () => {
  try {
    const user = await prisma.user.findMany({
      where: {
        isVisible: true,
        isUse: true,
        level: 1,
      },
      orderBy: {
        ['idx']: 'asc',
      },
    });

    return user;
  } catch {
    return null;
  }
};
