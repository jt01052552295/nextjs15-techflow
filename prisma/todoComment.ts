import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
const prisma = new PrismaClient();

async function main() {
  const todos = [];

  for (let i = 0; i < 100; i++) {
    todos.push({
      todoId: '704a301b-99fe-4c16-973e-0c5fcd586ff0',
      author: '81cf6d86-72da-45ad-8440-2ea76ded67bb',
      content: faker.lorem.paragraph(),
      content2: faker.lorem.paragraph(),
    });
  }

  await prisma.todosComment.createMany({
    data: todos,
  });

  console.log('100 todo comments created!');
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
