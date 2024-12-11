import { PrismaClient, Request } from '@prisma/client';
import { Scenes } from 'telegraf';

export const DELETE_REQUEST_SCENE = 'deleteRequest';
const deleteRequestScene = new Scenes.BaseScene<TelegrafContext>(
  DELETE_REQUEST_SCENE
);

const message = (data: Request) => `Заявка №${data.id} удалена.`;

deleteRequestScene.enter(async (ctx) => {
  const prisma = new PrismaClient();
  const requestId = ctx.scene.state.requestId;
  const updatedRequest = await prisma.request
    .update({
      where: { id: requestId },
      data: { deletedAt: new Date() },
    })
    .catch((err) => {
      console.error(err);
      return null;
    });

  if (updatedRequest) {
    await ctx.reply(message(updatedRequest), {
      parse_mode: 'Markdown',
    });
  } else {
    await ctx.reply('Заявка не найдена.');
  }
});

deleteRequestScene.action('go_back', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.scene.leave();
});

export default deleteRequestScene;
