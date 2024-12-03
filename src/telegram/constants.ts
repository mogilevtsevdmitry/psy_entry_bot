import { Request, User } from '@prisma/client';

export const messages = {
  hello: `
*Привет!*
Я помогу вам записаться на приём 🤗`,
  helloAdmin: `Привет, хозяина 💕`,
  help: `Тут будет помощь`,
  newRequest: (req: Request & { user: User }) => `
👤 *Новая заявка от клиента:*\n
📞 *Телефон*: \`${req.user.phone}\`
🙋 *Имя*: ${req.name}
📝 *Запрос*: ${req.request}
`,
};
export const commands = {
  start: {
    name: 'start',
    description: 'Старт приложения',
  },
  help: {
    name: 'help',
    description: 'Помощь',
  },
  active: {
    name: 'active',
    description: 'Получить список активных запросов',
  },
  in_work: {
    name: 'in_work',
    description: 'Получить список запросов в работе',
  },
  deleted: {
    name: 'deleted',
    description: 'Получить список удаленных запросов',
  },
} as const;
