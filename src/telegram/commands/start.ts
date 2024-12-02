import { messages } from '../constants';
import { TelegrafContext } from '../interfaces';

export const start = (ctx: TelegrafContext) => {
  return ctx.reply(messages.hello, { parse_mode: 'Markdown' });
};
