import { Context } from 'telegraf';
import { Message, Update } from 'telegraf/typings/core/types/typegram';

export const getChatId = (ctx: Context) =>
  (
    ctx as Context<{
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }>
  ).message.chat.id;
