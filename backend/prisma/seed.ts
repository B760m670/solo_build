import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tasks = [
    {
      title: 'Complete Platform Survey',
      description: 'Share your feedback about the Brabble platform experience. Takes about 5 minutes.',
      category: 'survey',
      reward: 25,
      verificationType: 'MANUAL',
      verificationPolicy: {
        proofType: 'TEXT',
        requiredFields: ['text'],
        autoCheckRules: [],
        minTextLength: 20,
      },
      timeMinutes: 5,
      brand: 'Brabble',
      totalSlots: 500,
    },
    {
      title: 'Review TON Wallet App',
      description: 'Download and review the TON Wallet app on your device. Write a detailed review.',
      category: 'review',
      reward: 50,
      verificationType: 'MANUAL',
      verificationPolicy: {
        proofType: 'LINK',
        requiredFields: ['link', 'text'],
        autoCheckRules: [],
        minTextLength: 30,
      },
      timeMinutes: 8,
      brand: 'TON Wallet',
      totalSlots: 200,
    },
    {
      title: 'Test New Chat Feature',
      description: 'Test the new group chat feature and report any bugs you find.',
      category: 'test',
      reward: 75,
      verificationType: 'MANUAL',
      verificationPolicy: {
        proofType: 'TEXT',
        requiredFields: ['text'],
        autoCheckRules: [],
        minTextLength: 40,
      },
      timeMinutes: 10,
      brand: 'Brabble Labs',
      totalSlots: 100,
    },
    {
      title: 'Subscribe to Telegram Channel',
      description: 'Join and subscribe to our official Telegram announcement channel.',
      category: 'subscribe',
      reward: 10,
      verificationType: 'MANUAL',
      verificationPolicy: {
        proofType: 'LINK',
        requiredFields: ['link'],
        autoCheckRules: [],
      },
      timeMinutes: 3,
      brand: 'Brabble',
      totalSlots: 1000,
    },
    {
      title: 'DeFi Protocol Feedback',
      description: 'Try the DeFi staking interface and provide structured feedback.',
      category: 'survey',
      reward: 100,
      verificationType: 'MANUAL',
      verificationPolicy: {
        proofType: 'TEXT',
        requiredFields: ['text'],
        autoCheckRules: [],
        minTextLength: 50,
      },
      timeMinutes: 12,
      brand: 'Partner Protocol',
      sponsorName: 'Partner Protocol',
      sponsorType: 'PARTNER',
      kpiName: 'Qualified Feedback',
      kpiTarget: 150,
      kpiUnit: 'submissions',
      minReputation: 60,
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
