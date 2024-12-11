import { PrismaClient, RequestStatus } from '@prisma/client';
import { Pagination } from '../command-service';
import { format } from 'date-fns';

export const activeRequest = async (
  ctx: TelegrafContext,
  prisma: PrismaClient,
  pagination: Pagination
) => {
  const PAGE_SIZE = 5;
  const [requests, count] = await Promise.all([
    prisma.request.findMany({
      where: { deletedAt: null, status: RequestStatus.IN_WORK },
      take: pagination.limit,
      skip: pagination.offset,
    }),
    prisma.request.count({
      where: { deletedAt: null, status: RequestStatus.IN_WORK },
    }),
  ]);

  if (!count) {
    return ctx.reply('Нет запросов в работе');
  }

  const buttons = requests.map((request) => [
    {
      text: `Заявка №${request.id} от ${request.name} (${format(
        request.createdAt,
        'dd.MM.yyyy'
      )})`,
      callback_data: `view_request_${request.id}`,
    },
  ]);

  const navigationButtons = [];
  const totalPages = Math.ceil(count / PAGE_SIZE) - 1;
  if (pagination.offset > 0) {
    navigationButtons.push({
      text: '⬅️ Назад',
      callback_data: `active_request_${pagination.offset - 1}`,
    });
  }
  if (pagination.offset < totalPages) {
    navigationButtons.push({
      text: 'Вперед ➡️',
      callback_data: `active_request_${pagination.offset + 1}`,
    });
  }

  if (navigationButtons.length) {
    buttons.push(navigationButtons);
  }

  await ctx.reply('*ЗАЯВКИ В РАБОТЕ*', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: buttons,
    },
  });
};
