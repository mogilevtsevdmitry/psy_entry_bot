import { PrismaClient } from '@prisma/client';
import { messages } from '@telegram/constants';
import { TelegrafContext } from '@telegram/interfaces';
import { BotCommand } from 'telegraf/typings/core/types/typegram';
import { commands, ICommand } from './commands';
import { activeRequest } from './use-cases/active-request';
import { completedRequests } from './use-cases/completed-requests';
import { declineRequests } from './use-cases/decline-requests';
import { deletedRequests } from './use-cases/deleted-requests';
import { inWorkRequests } from './use-cases/request-in-work';

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

  protected async request_in_work(ctx: TelegrafContext): Promise<void> {
    const pagination = new Pagination();
    await inWorkRequests(ctx, this.prisma, pagination);
  }

  protected async deleted_request(ctx: TelegrafContext): Promise<void> {
    const pagination = new Pagination();
    await deletedRequests(ctx, this.prisma, pagination);
  }

  protected async decline_request(ctx: TelegrafContext): Promise<void> {
    const pagination = new Pagination();
    await declineRequests(ctx, this.prisma, pagination);
  }

  protected async complete_request(ctx: TelegrafContext): Promise<void> {
    const pagination = new Pagination();
    await completedRequests(ctx, this.prisma, pagination);
  }

  protected help(ctx: TelegrafContext): void {
    ctx.reply(messages.help);
  }
}
