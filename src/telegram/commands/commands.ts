export const commands = [
  {
    name: 'start',
    description: 'Запуск приложения',
    isAdmin: false,
  },
  {
    name: 'active_request',
    description: 'Список активных заявок',
    isAdmin: true,
  },
  {
    name: 'request_in_work',
    description: 'Запросы в работе',
    isAdmin: true,
  },
  {
    name: 'deleted_request',
    description: 'Удаленные запросы',
    isAdmin: true,
  },
];
