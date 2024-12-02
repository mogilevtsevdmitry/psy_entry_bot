export const messages = {
  hello: `
*Привет!*
Я помогу вам записаться на приём 🤗`,
};
export const commands = {
  start: {
    name: 'start',
    description: 'Старт приложения',
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
