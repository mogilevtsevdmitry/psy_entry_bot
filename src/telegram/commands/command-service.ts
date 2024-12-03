import { BotCommand } from 'telegraf/typings/core/types/typegram';
import { commands } from './commands';
import { start } from './start';

export class CommandService {
  private _publicCommands: BotCommand[] = [];
  private _allCommands: BotCommand[] = [];

  constructor() {
    // Разделяем команды на публичные и администраторские при инициализации
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
}
