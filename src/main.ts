import { Bot } from './telegram/bot';

const bootstrap = async () => {
  console.log('bootstrap');
  const bot = new Bot();

  // Добавьте отладочные сообщения
  console.log('Initializing bot...');
  await bot
    .launch()
    .catch((err) => {
      console.error('Error during bot launch:', err);
    });

  // Обработка завершения работы
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

void bootstrap();
