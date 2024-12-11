import { PrismaClient, Request } from '@prisma/client';
import { Scenes } from 'telegraf';

export const COMPLETE_REQUEST_SCENE = 'completeRequest';
const completeRequestScene = new Scenes.BaseScene<TelegrafContext>(
  COMPLETE_REQUEST_SCENE
);

const message = (data: Request) => `Заявка №${data.id} помечена как выполненная.`;

completeRequestScene.enter(async (ctx) => {
  const prisma = new PrismaClient();
  const requestId = ctx.scene.state.requestId;
  const updatedRequest = await prisma.request
    .update({
      where: { id: requestId },
      data: { status: 'COMPLETE' },
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

completeRequestScene.action('go_back', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.scene.leave();
});

export default completeRequestScene;
