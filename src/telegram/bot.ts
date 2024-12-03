import { TelegrafContext } from '@telegram/interfaces';
import dotenv from 'dotenv';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { CommandService } from './commands';
import { isAdmin } from './utils';
import { ConfigService } from '@core/config.service';
import { start } from './commands/start';

dotenv.config();

export class Bot extends CommandService {
  private bot: Telegraf<Context<Update>>;
  private commandService: CommandService;
  private configService: ConfigService;

  constructor() {
    super();

    this.configService = new ConfigService();
    this.bot = new Telegraf(this.configService.telegramToken);
    this.commandService = new CommandService();
    // Очистка всех команд при старте
    this.bot.telegram.setMyCommands([]);
    this.start();
  }

  async launch() {
    await this.bot.launch();
  }

  stop(reason?: string) {
    this.bot.stop(reason);
  }

  private start() {
    return this.bot.start(async (ctx: TelegrafContext) => {
      await this.registerCommands(ctx);
      void start(ctx);
    });
  }

  /**
   * Регистрация команд
   */
  private async registerCommands(ctx: TelegrafContext) {
    console.log({ publicCommands: this.commandService.publicCommands });

    // Если пользователь — администратор, добавляем все команды
    const adminId = this.configService.adminId;
    console.log({ isAdmin: isAdmin(ctx) });
    if (isAdmin(ctx)) {
      console.log({ allCommands: this.commandService.allCommands });
      await this.bot.telegram.setMyCommands(this.commandService.allCommands, {
        scope: { type: 'chat', chat_id: adminId },
      });
    } else {
      await this.bot.telegram.setMyCommands(this.commandService.publicCommands);
    }

    const methods = Object.getOwnPropertyNames(CommandService.prototype).filter(
      (method) =>
        method !== 'constructor' &&
        typeof this[method as keyof Bot] === 'function'
    );
    methods.forEach(this.setCommand.bind(this));
  }

  private async setCommand(method: string) {
    console.log('Register command: ', method);
    this.bot.command(method, async (ctx: TelegrafContext) => {
      await (this[method as keyof Bot] as Function)(ctx);
    });
  }
}
