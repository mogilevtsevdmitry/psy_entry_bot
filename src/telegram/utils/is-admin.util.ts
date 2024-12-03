export const isAdmin = (ctx: TelegrafContext): boolean => {
  const adminId = process.env.PSYCHOLOGIST_CHAT_ID;
  if (!adminId) {
    throw new Error('PSYCHOLOGIST_CHAT_ID is not defined in .env');
  }
  return ctx.chat?.id.toString() === adminId;
};
