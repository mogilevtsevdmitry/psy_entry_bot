import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { message } from 'telegraf/filters';

dotenv.config();

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined in .env');
}

if (!process.env.PSYCHOLOGIST_CHAT_ID) {
  throw new Error('PSYCHOLOGIST_CHAT_ID is not defined in .env');
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Обработчик команды /start
bot.start((ctx) => {
  ctx.reply('Привет! Я ваш Telegram-бот. Чем могу помочь?');
});

bot.on(message('text'), (ctx) => {
  console.log(ctx.message);
  ctx.reply(`Вы написали: ${ctx.message.text}`);
});

// Запуск бота
bot.launch().then(() => {
  console.log('Telegram bot is running...');
});

// Обработка завершения работы
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
