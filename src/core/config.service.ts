export class ConfigService {
  get adminId(): number {
    const id = process.env.PSYCHOLOGIST_CHAT_ID;
    if (!id) throw new Error('PSYCHOLOGIST_CHAT_ID not set');
    return +id;
  }

  get telegramToken(): string {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set');
    return token;
  }
}
