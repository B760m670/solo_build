import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tasks = [
    {
      title: 'Complete Platform Survey',
      description: 'Share your feedback about the Brabble platform experience. Takes about 5 minutes.',
      category: 'survey',
      reward: 25,
      type: 'survey',
      maxCompletions: 500,
    },
    {
      title: 'Review TON Wallet App',
      description: 'Download and review the TON Wallet app on your device. Write a detailed review.',
      category: 'review',
      reward: 50,
      type: 'review',
      maxCompletions: 200,
    },
    {
      title: 'Test New Chat Feature',
      description: 'Test the new group chat feature and report any bugs you find.',
      category: 'test',
      reward: 75,
      type: 'test',
      maxCompletions: 100,
    },
    {
      title: 'Subscribe to Telegram Channel',
      description: 'Join and subscribe to our official Telegram announcement channel.',
      category: 'subscribe',
      reward: 10,
      type: 'social',
      maxCompletions: 1000,
    },
    {
      title: 'DeFi Protocol Feedback',
      description: 'Try the DeFi staking interface and provide structured feedback.',
      category: 'survey',
      reward: 100,
      type: 'survey',
      maxCompletions: 150,
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
