import { REGISTER_REQUEST_SCENE } from '@telegram/scenes/register-request.scene';
import { isAdmin } from '@telegram/utils';
import { messages } from '../../constants';

export const start = async (ctx: TelegrafContext) => {
  const _isAdmin = isAdmin(ctx);
  await ctx.reply(isAdmin(ctx) ? messages.helloAdmin : messages.hello, {
    parse_mode: 'Markdown',
  });
  if (!_isAdmin) {
    // Переход в сцену регистрации заявки
    await ctx.scene.enter(REGISTER_REQUEST_SCENE);
  }
};
