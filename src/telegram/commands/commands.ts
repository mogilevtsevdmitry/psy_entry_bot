export enum ICommandName {
  start = 'start',
  active_request = 'active_request',
  request_in_work = 'request_in_work',
  deleted_request = 'deleted_request',
  decline_request = 'decline_request',
  complete_request = 'complete_request',
  help = 'help',
}

export interface ICommand {
  name: ICommandName;
  description: string;
  isAdmin: boolean;
}
export const commands: ICommand[] = [
  {
    name: ICommandName.start,
    description: 'Запуск приложения',
    isAdmin: false,
  },
  // {
  //   name: ICommandName.help,
  //   description: 'Помощь',
  //   isAdmin: false,
  // },
  {
    name: ICommandName.active_request,
    description: 'Список активных заявок',
    isAdmin: true,
  },
  {
    name: ICommandName.request_in_work,
    description: 'Запросы в работе',
    isAdmin: true,
  },
  {
    name: ICommandName.deleted_request,
    description: 'Удаленные запросы',
    isAdmin: true,
  },
  {
    name: ICommandName.decline_request,
    description: 'Отклоненные запросы',
    isAdmin: true,
  },
  {
    name: ICommandName.complete_request,
    description: 'Завершенные запросы',
    isAdmin: true,
  },
];
