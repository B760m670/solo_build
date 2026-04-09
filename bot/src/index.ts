import { Bot, InlineKeyboard } from 'grammy';
import 'dotenv/config';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required');
}

const webappUrl = process.env.WEBAPP_URL || 'https://your-app.vercel.app';
const bot = new Bot(token);

bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('Open Brabble', webappUrl);

  await ctx.reply(
    'Welcome to Brabble — your modular Web3 ecosystem.\n\n' +
      'Earn BRB tokens, trade on the marketplace, and access Web3 tools — all inside Telegram.',
    { reply_markup: keyboard },
  );
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    'Brabble Commands:\n\n' +
      '/start - Open the app\n' +
      '/help - Show this message\n' +
      '/balance - Check your BRB balance\n\n' +
      'BRB is a utility token providing access to Brabble features. ' +
      'Not a financial instrument. Not investment advice.',
  );
});

bot.command('balance', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('Open Wallet', webappUrl);
  await ctx.reply('Open the app to check your BRB balance.', {
    reply_markup: keyboard,
  });
});

bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

bot.on('message:successful_payment', async (ctx) => {
  await ctx.reply(
    'Payment received. Your premium subscription is now active.',
  );
});

bot.start({
  onStart: () => console.log('Brabble bot is running'),
});
