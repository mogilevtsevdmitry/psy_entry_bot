import { PrismaClient, Request, RequestStatus, User } from '@prisma/client';
import { ChangeStatusEnum } from '@telegram/commands/use-cases/change-status';
import { format } from 'date-fns';
import { Scenes } from 'telegraf';

export const VIEW_REQUEST_SCENE = 'viewRequest';
const viewRequestScene = new Scenes.BaseScene<TelegrafContext>(
  VIEW_REQUEST_SCENE
);

const formatRequest = (data: Request & { user: User }) => `
*Заявка:* №${data.id}\n
*Имя:* ${data.user.lastName} ${data.user.firstName}\n
*Телефон*: ${data.user.phone}\n
*Дата запроса*: ${format(data.createdAt, 'dd.MM.yyyy')}\n
*Запрос:* ${data.request}
`;

const actionBtnByStatus = (id: number, status: RequestStatus) => {
  switch (status) {
    case 'ACTIVE':
      return [
        [
          {
            text: 'В работу 📝',
            callback_data: `change_request_${ChangeStatusEnum.IN_WORK}_${id}`,
          },
        ],
        [
          {
            text: 'Отклонить ❌',
            callback_data: `change_request_${ChangeStatusEnum.DECLINE}_${id}`,
          },
        ],
      ];
    case 'COMPLETE':
      return [
        [
          {
            text: 'Удалить 🗑️',
            callback_data: `change_request_${ChangeStatusEnum.DELETE}_${id}`,
          },
        ],
      ];
    case 'DECLINE':
      return [
        [
          {
            text: 'Удалить 🗑️',
            callback_data: `change_request_${ChangeStatusEnum.DELETE}_${id}`,
          },
        ],
      ];
    case 'IN_WORK':
      return [
        [
          {
            text: 'Выполнено ✅',
            callback_data: `change_request_${ChangeStatusEnum.COMPLETE}_${id}`,
          },
        ],
        [
          {
            text: 'Отклонить ❌',
            callback_data: `change_request_${ChangeStatusEnum.DECLINE}_${id}`,
          },
        ],
      ];
    default:
      return [];
  }
};

viewRequestScene.enter(async (ctx) => {
  const prisma = new PrismaClient();
  const requestId = ctx.scene.state.requestId;

  const requestData = await prisma.request
    .findUnique({
      where: { id: requestId, deletedAt: null },
      include: { user: true },
    })
    .catch((err) => {
      console.error(err);
      return null;
    });

  if (requestData) {
    await ctx.reply(formatRequest(requestData), {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: actionBtnByStatus(requestId, requestData.status),
      },
    });
  } else {
    await ctx.reply('Заявка не найдена.');
  }
});

viewRequestScene.action('go_back', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.scene.leave();
});

export default viewRequestScene;
