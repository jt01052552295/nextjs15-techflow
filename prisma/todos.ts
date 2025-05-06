import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const todos = [];

  const password = '1111';
  const hashedPassword = await bcrypt.hash(password, 10);

  for (let i = 0; i < 200; i++) {
    todos.push({
      name: faker.lorem.words(3),
      email: faker.internet.email(),
      gender: faker.person.sexType(),
      img1: faker.image.avatar(),
      ipAddress: faker.internet.ipv4(),
      content: faker.lorem.paragraph(),
      content2: faker.lorem.paragraph(),
      createdAt: new Date(),
      password: hashedPassword,
      sortOrder: i + 1,
    });
  }

  await prisma.todos.createMany({
    data: todos,
  });

  console.log('200 todos created!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
