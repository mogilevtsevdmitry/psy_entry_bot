import { PrismaClient, Request } from '@prisma/client';
import { Scenes } from 'telegraf';

export const DECLINE_REQUEST_SCENE = 'declineRequest';
const declineRequestScene = new Scenes.BaseScene<TelegrafContext>(
  DECLINE_REQUEST_SCENE
);

const message = (data: Request) => `Заявка №${data.id} отменена.`;

declineRequestScene.enter(async (ctx) => {
  const prisma = new PrismaClient();
  const requestId = ctx.scene.state.requestId;
  const updatedRequest = await prisma.request
    .update({
      where: { id: requestId },
      data: { status: 'DECLINE' },
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

declineRequestScene.action('go_back', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.scene.leave();
});

export default declineRequestScene;
