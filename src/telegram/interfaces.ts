import { Context } from 'telegraf';
import { Message, Update } from 'telegraf/typings/core/types/typegram';

export type TelegrafContext = Context<{
  message: Update.New & Update.NonChannel & Message.TextMessage;
  update_id: number;
}>;
