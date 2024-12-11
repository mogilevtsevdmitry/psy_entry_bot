import { PrismaClient, Request } from '@prisma/client';
import { Scenes } from 'telegraf';

export const IN_WORK_REQUEST_SCENE = 'inWorkRequest';
const inWorkRequestScene = new Scenes.BaseScene<TelegrafContext>(
  IN_WORK_REQUEST_SCENE
);

const message = (data: Request) => `Заявка №${data.id} в работе.`;

inWorkRequestScene.enter(async (ctx) => {
  const prisma = new PrismaClient();
  const requestId = ctx.scene.state.requestId;
  const updatedRequest = await prisma.request
    .update({
      where: { id: requestId },
      data: { status: 'IN_WORK' },
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

inWorkRequestScene.action('go_back', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.scene.leave();
});

export default inWorkRequestScene;
