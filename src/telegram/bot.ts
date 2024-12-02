import dotenv from 'dotenv';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { CommandService } from './commands';

dotenv.config();

export class Bot extends CommandService {
  private bot: Telegraf<Context<Update>>;

  constructor() {
    super();

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined in .env');
    }

    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

    // Регистрируем команды
    this.registerCommands();
  }

  private registerCommands() {
    // Получаем имена всех методов, исключая конструктор
    const methods = Object.getOwnPropertyNames(CommandService.prototype).filter(
      // @ts-ignore
      (method) => method !== 'constructor' && typeof this[method] === 'function'
    );

    methods.forEach((method) => {
      console.log(`Registering command: /${method}`);

      // Регистрируем команду в боте
      this.bot.command(method, (ctx) => {
        // Вызываем метод из CommandService с передачей контекста
        // @ts-ignore
        (this[method] as Function)(ctx);
      });
    });
  }

  async launch() {
    await this.bot.launch();
  }

  stop(reason?: string) {
    this.bot.stop(reason);
  }
}
