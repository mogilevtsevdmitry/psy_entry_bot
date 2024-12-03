import { ConfigService } from '@core/config.service';
import dotenv from 'dotenv';
import { Context, Scenes, session, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { CommandService } from './commands';
import { handleCallbackQuery } from './commands/callback-handlers/handle-callback.query';
import { start } from './commands/use-cases/start';
import { SCENES } from './scenes';
import { isAdmin } from './utils';

dotenv.config();

export class Bot extends CommandService {
  private bot: Telegraf<Context<Update>>;
  private commandService: CommandService;
  private configService: ConfigService;
  private stage: Scenes.Stage<TelegrafContext>;

  constructor() {
    super();

    this.configService = new ConfigService();
    this.bot = new Telegraf(this.configService.telegramToken);
    this.commandService = new CommandService();
    this.stage = new Scenes.Stage(SCENES);
    this.bot.use(session());
    this.bot.use(this.stage.middleware());
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

  private async start() {
    return this.bot.start(async (ctx: TelegrafContext) => {
      await this.registerCommands(ctx);
      this.bot.on('callback_query', handleCallbackQuery);
      await start(ctx);
    });
  }

  /**
   * Регистрация команд
   */
  private async registerCommands(ctx: TelegrafContext) {
    // Если пользователь — администратор, добавляем все команды
    const adminId = this.configService.adminId;
    if (isAdmin(ctx)) {
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
    this.bot.command(method, async (ctx: TelegrafContext) => {
      await (this[method as keyof Bot] as Function)(ctx);
    });
  }
}
