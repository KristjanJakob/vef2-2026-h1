import { PrismaClient, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany();
  await prisma.rSVP.deleteMany();
  await prisma.eventImage.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = 'admin123';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminHash,
      role: Role.ADMIN,
    },
  });

  const users = [admin];
  for (let i = 0; i < 15; i++) {
    const hash = await bcrypt.hash('password123', 10);
    users.push(
      await prisma.user.create({
        data: {
          username: faker.internet.username().toLowerCase().slice(0, 30),
          password: hash,
          role: Role.USER,
        },
      }),
    );
  }

  const categoryData = [
    ['Tónlist', 'tonlist'],
    ['Partý', 'party'],
    ['Hátíð', 'hatid'],
    ['Fyrirlestur', 'fyrirlestur'],
    ['Íþróttir', 'ithrottir'],
    ['Stand-up', 'standup'],
  ];

  const categories = [];
  for (const [name, slug] of categoryData) {
    categories.push(await prisma.category.create({ data: { name, slug } }));
  }

  const locationData = [
    ['Reykjavík', 'reykjavik'],
    ['Kópavogur', 'kopavogur'],
    ['Hafnarfjörður', 'hafnarfjordur'],
    ['Akureyri', 'akureyri'],
    ['Selfoss', 'selfoss'],
    ['Keflavík', 'keflavik'],
  ];

  const locations = [];
  for (const [name, slug] of locationData) {
    locations.push(await prisma.location.create({ data: { name, slug } }));
  }

  const events = [];
  for (let i = 0; i < 35; i++) {
    const startsAt = faker.date.soon({ days: 60 });
    const endsAt = faker.datatype.boolean()
      ? faker.date.soon({ days: 1, refDate: startsAt })
      : null;

    const owner = users[faker.number.int({ min: 0, max: users.length - 1 })];
    const category = categories[faker.number.int({ min: 0, max: categories.length - 1 })];
    const location = locations[faker.number.int({ min: 0, max: locations.length - 1 })];

    events.push(
      await prisma.event.create({
        data: {
          title: faker.lorem.words({ min: 2, max: 5 }).slice(0, 120),
          description: faker.lorem.paragraphs({ min: 1, max: 2 }),
          startsAt,
          endsAt: endsAt ?? undefined,
          status: 'PUBLISHED',
          userId: owner.id,
          categoryId: category.id,
          locationId: location.id,
        },
      }),
    );
  }

  for (let i = 0; i < 60; i++) {
    const user = users[faker.number.int({ min: 0, max: users.length - 1 })];
    const event = events[faker.number.int({ min: 0, max: events.length - 1 })];

    try {
      await prisma.rSVP.create({
        data: { userId: user.id, eventId: event.id },
      });
    } catch {
        // hunsa
    }

    await prisma.comment.create({
      data: {
        body: faker.lorem.sentence().slice(0, 500),
        userId: user.id,
        eventId: event.id,
      },
    });
  }

  console.log('Seed complete ✅');
  console.log('Admin login:', { username: 'admin', password: adminPassword });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });