import { PrismaClient } from '@prisma/client';
import { TelegrafContext } from '@telegram/interfaces';
import { BotCommand } from 'telegraf/typings/core/types/typegram';
import { commands, ICommand } from './commands';
import { activeRequest } from './use-cases/active-request';
import { messages } from '@telegram/constants';

export type CommandServiceInterface = {
  [K in ICommand['name']]: (ctx: TelegrafContext) => void;
};

export class Pagination {
  private _offset: number;
  private _limit: number;

  constructor(offset: number = 0, limit: number = 10) {
    this._offset = offset;
    this._limit = limit;
  }

  get offset(): number {
    return this._offset;
  }
  get limit(): number {
    return this._limit;
  }
}

export class CommandService {
  private _publicCommands: BotCommand[] = [];
  private _allCommands: BotCommand[] = [];
  private prisma: PrismaClient;

  constructor() {
    // Разделяем команды на публичные и администраторские при инициализации
    this.manageCommands();
    this.prisma = new PrismaClient();
  }

  private manageCommands() {
    commands.forEach((command) => {
      if (!command.isAdmin) {
        this._publicCommands.push({
          command: command.name,
          description: command.description,
        });
      }
      this._allCommands.push({
        command: command.name,
        description: command.description,
      });
    });
  }

  /**
   * Получить команды для всех пользователей
   */
  get publicCommands(): BotCommand[] {
    return this._publicCommands;
  }

  /**
   * Получить команды для администратора
   */
  get allCommands(): BotCommand[] {
    return this._allCommands;
  }

  protected async active_request(ctx: TelegrafContext): Promise<void> {
    const pagination = new Pagination();
    await activeRequest(ctx, this.prisma, pagination);
  }

  protected request_in_work(ctx: TelegrafContext): void {
    ctx.reply('request_in_work');
  }

  protected deleted_request(ctx: TelegrafContext): void {
    ctx.reply('deleted_request');
  }

  protected help(ctx: TelegrafContext): void {
    ctx.reply(messages.help);
  }
}
