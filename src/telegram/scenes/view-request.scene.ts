import { PrismaClient, Request, User } from '@prisma/client';
import { format } from 'date-fns';
import { Scenes } from 'telegraf';

export const VIEW_REQUEST_SCENE = 'viewRequest';
const viewRequestScene = new Scenes.BaseScene<TelegrafContext>(
  VIEW_REQUEST_SCENE
);

const formatRequest = (data: Request & { user: User }) => `
*Заявка:* ${data.id}\n
*Имя:* ${data.user.lastName} ${data.user.firstName}\n
*Телефон*: ${data.user.phone}\n
*Дата запроса*: ${format(data.createdAt, 'dd.MM.yyyy')}\n
*Запрос:* ${data.request}
`;

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
        inline_keyboard: [
          [
            {
              text: 'Перейти в чат',
              url: `https://t.me/${requestData.user.username}`,
            },
          ],
        ],
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
