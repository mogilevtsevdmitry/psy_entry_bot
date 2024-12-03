import { ConfigService } from '@core/config.service';

export const isAdmin = (ctx: TelegrafContext): boolean => {
  const configService = new ConfigService();
  const adminId = configService.adminId;
  if (!adminId) {
    throw new Error('PSYCHOLOGIST_CHAT_ID is not defined in .env');
  }
  return ctx.chat?.id === adminId || ctx.callbackQuery?.from?.id === adminId;
};
