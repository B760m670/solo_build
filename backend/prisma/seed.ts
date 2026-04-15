import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Unisouq demo data...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.userTask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.user.deleteMany();

  // ─── Demo sellers (brand-side bootstrap) ───
  const alice = await prisma.user.create({
    data: {
      telegramId: BigInt(9000001),
      username: 'alice_design',
      firstName: 'Alice',
      starsBalance: 0,
      reputationScore: 420,
      reputationTier: 'EXPERT',
      completedDeals: 38,
      averageRating: 4.8,
      reviewCount: 32,
      totalEarnedStars: 18500,
    },
  });

  const omar = await prisma.user.create({
    data: {
      telegramId: BigInt(9000002),
      username: 'omar_dev',
      firstName: 'Omar',
      starsBalance: 0,
      reputationScore: 780,
      reputationTier: 'ELITE',
      completedDeals: 92,
      averageRating: 4.9,
      reviewCount: 85,
      totalEarnedStars: 61200,
    },
  });

  const mira = await prisma.user.create({
    data: {
      telegramId: BigInt(9000003),
      username: 'mira_writes',
      firstName: 'Mira',
      starsBalance: 0,
      reputationScore: 150,
      reputationTier: 'TRUSTED',
      completedDeals: 12,
      averageRating: 4.6,
      reviewCount: 10,
      totalEarnedStars: 3200,
    },
  });

  // ─── Demo listings ───
  await prisma.listing.createMany({
    data: [
      {
        sellerId: alice.id,
        title: 'Minimalist logo design in 24h',
        description:
          'Clean, modern logo delivered as SVG + PNG. Two revisions included. Brand brief required.',
        category: 'DESIGN',
        priceStars: 500,
        deliveryDays: 1,
        orderCount: 38,
        averageRating: 4.8,
        reviewCount: 32,
      },
      {
        sellerId: alice.id,
        title: 'Telegram Mini App UI kit',
        description: 'Complete Figma UI kit tailored for Telegram Mini Apps. Dark + light themes.',
        category: 'DESIGN',
        priceStars: 1200,
        deliveryDays: 3,
        orderCount: 14,
        averageRating: 4.9,
        reviewCount: 12,
      },
      {
        sellerId: omar.id,
        title: 'Smart contract audit (TON / FunC)',
        description:
          'Professional security review of your FunC smart contract with detailed report and fix recommendations.',
        category: 'DEVELOPMENT',
        priceStars: 4500,
        deliveryDays: 5,
        orderCount: 22,
        averageRating: 5.0,
        reviewCount: 22,
      },
      {
        sellerId: omar.id,
        title: 'Custom Telegram bot (Grammy.js)',
        description: 'Fully working Telegram bot with the features you need. Source code included.',
        category: 'DEVELOPMENT',
        priceStars: 2000,
        deliveryDays: 4,
        orderCount: 31,
        averageRating: 4.9,
        reviewCount: 28,
      },
      {
        sellerId: mira.id,
        title: 'SEO blog post (1000 words)',
        description:
          'Well-researched, original blog post in your niche. Keyword-optimized. One revision included.',
        category: 'WRITING',
        priceStars: 300,
        deliveryDays: 2,
        orderCount: 8,
        averageRating: 4.5,
        reviewCount: 7,
      },
      {
        sellerId: mira.id,
        title: 'Product description pack (10 items)',
        description: 'Persuasive product copy for e-commerce. Up to 80 words per item.',
        category: 'MARKETING',
        priceStars: 450,
        deliveryDays: 2,
        orderCount: 4,
        averageRating: 4.7,
        reviewCount: 3,
      },
    ],
  });

  // ─── Demo brand tasks ───
  await prisma.task.createMany({
    data: [
      {
        brandName: 'TON Wallet',
        title: 'Try TON Wallet and share a screenshot',
        description:
          'Install TON Wallet, create an account, and send us a screenshot of your main screen. Your wallet address is never collected.',
        proofType: 'SCREENSHOT',
        rewardStars: 30,
        totalSlots: 500,
        fundedTon: 50,
      },
      {
        brandName: 'Notcoin',
        title: 'Subscribe to the official Notcoin channel',
        description: 'Subscribe to @notcoin_official and paste the link to your username as proof.',
        proofType: 'LINK',
        rewardStars: 15,
        totalSlots: 1000,
        fundedTon: 40,
      },
      {
        brandName: 'Hamster Kombat',
        title: 'Write a short review (min 50 words)',
        description:
          'Share your honest experience with Hamster Kombat. Min 50 words in English or Russian.',
        proofType: 'TEXT',
        rewardStars: 50,
        totalSlots: 200,
        fundedTon: 60,
      },
      {
        brandName: 'Unisouq',
        title: 'Complete your first Unisouq purchase',
        description:
          'Buy any listing on Unisouq marketplace. Screenshot of the completed order confirms the task.',
        proofType: 'SCREENSHOT',
        rewardStars: 100,
        totalSlots: 300,
        fundedTon: 120,
      },
    ],
  });

  console.log('Seed completed.');
  console.log(`  Users: 3`);
  console.log(`  Listings: 6`);
  console.log(`  Tasks: 4`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
