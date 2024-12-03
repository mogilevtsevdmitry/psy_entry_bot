import { PrismaClient, RequestStatus } from '@prisma/client';
import { Pagination } from '../command-service';
import { format } from 'date-fns';

export const activeRequest = async (
  ctx: TelegrafContext,
  prisma: PrismaClient,
  pagination: Pagination
) => {
  const PAGE_SIZE = 10;
  const [requests, count] = await Promise.all([
    prisma.request.findMany({
      where: { deletedAt: null, status: RequestStatus.ACTIVE },
      take: pagination.limit,
      skip: pagination.offset,
    }),
    prisma.request.count({
      where: { deletedAt: null, status: RequestStatus.ACTIVE },
    }),
  ]);

  if (!count) {
    return ctx.reply('Нет активных запросов');
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

  await ctx.reply('Активные заявки', {
    reply_markup: {
      inline_keyboard: buttons,
    },
  });
};
