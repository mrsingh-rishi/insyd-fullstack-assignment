import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        username: 'alice',
        email: 'alice@example.com'
      }
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        username: 'bob',
        email: 'bob@example.com'
      }
    }),
    prisma.user.upsert({
      where: { email: 'charlie@example.com' },
      update: {},
      create: {
        username: 'charlie',
        email: 'charlie@example.com'
      }
    }),
    prisma.user.upsert({
      where: { email: 'diana@example.com' },
      update: {},
      create: {
        username: 'diana',
        email: 'diana@example.com'
      }
    })
  ]);

  console.log('✅ Created users:', users.map(u => u.username).join(', '));

  // Create some follow relationships
  const follows = [
    { followerId: users[0].id, followingId: users[1].id }, // alice follows bob
    { followerId: users[0].id, followingId: users[2].id }, // alice follows charlie
    { followerId: users[1].id, followingId: users[0].id }, // bob follows alice
    { followerId: users[2].id, followingId: users[0].id }, // charlie follows alice
    { followerId: users[3].id, followingId: users[1].id }, // diana follows bob
  ];

  for (const follow of follows) {
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: follow.followerId,
          followingId: follow.followingId
        }
      },
      update: {},
      create: follow
    });
  }

  console.log('✅ Created follow relationships');

  // Create some initial content
  const content = await Promise.all([
    prisma.content.create({
      data: {
        userId: users[1].id, // bob
        type: 'BLOG',
        title: 'Getting Started with TypeScript',
        body: 'TypeScript is a powerful superset of JavaScript that adds static typing...'
      }
    }),
    prisma.content.create({
      data: {
        userId: users[2].id, // charlie
        type: 'JOB',
        title: 'Senior Full Stack Developer',
        body: 'We are looking for an experienced full stack developer to join our team...'
      }
    }),
    prisma.content.create({
      data: {
        userId: users[0].id, // alice
        type: 'MESSAGE',
        title: 'Hello Everyone!',
        body: 'Just wanted to say hi and welcome to our notification system demo!'
      }
    }),
    prisma.content.create({
      data: {
        userId: users[3].id, // diana
        type: 'BLOG',
        title: 'Real-time Applications with Socket.IO',
        body: 'Building real-time applications has never been easier with Socket.IO...'
      }
    })
  ]);

  console.log('✅ Created initial content:', content.map(c => c.title).join(', '));

  // Get final counts
  const userCount = await prisma.user.count();
  const followCount = await prisma.follow.count();
  const contentCount = await prisma.content.count();
  const notificationCount = await prisma.notification.count();

  console.log('\n📊 Database Summary:');
  console.log(`   Users: ${userCount}`);
  console.log(`   Follows: ${followCount}`);
  console.log(`   Content: ${contentCount}`);
  console.log(`   Notifications: ${notificationCount}`);

  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
