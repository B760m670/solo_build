import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed tasks
  const tasks = [
    {
      title: 'Complete Platform Survey',
      description: 'Share your feedback about the Brabble platform experience. Takes about 5 minutes.',
      category: 'survey',
      reward: 25,
      timeMinutes: 5,
      brand: 'Brabble',
      totalSlots: 500,
    },
    {
      title: 'Review TON Wallet App',
      description: 'Download and review the TON Wallet app on your device. Write a detailed review.',
      category: 'review',
      reward: 50,
      timeMinutes: 15,
      brand: 'TON Foundation',
      totalSlots: 200,
    },
    {
      title: 'Test New Chat Feature',
      description: 'Test the new group chat feature and report any bugs you find.',
      category: 'test',
      reward: 75,
      timeMinutes: 20,
      brand: 'Brabble',
      totalSlots: 100,
    },
    {
      title: 'Subscribe to Telegram Channel',
      description: 'Join and subscribe to our official Telegram announcement channel.',
      category: 'subscribe',
      reward: 10,
      timeMinutes: 2,
      brand: 'Brabble',
      totalSlots: 1000,
    },
    {
      title: 'DeFi Protocol Feedback',
      description: 'Try the DeFi staking interface and provide structured feedback.',
      category: 'survey',
      reward: 100,
      timeMinutes: 30,
      brand: 'DeDust',
      totalSlots: 150,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log(`Seeded ${tasks.length} tasks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
