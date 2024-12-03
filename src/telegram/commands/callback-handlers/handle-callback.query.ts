import { REGISTER_REQUEST_SCENE } from '@telegram/scenes/register-request.scene';
import { VIEW_REQUEST_SCENE } from '@telegram/scenes/view-request.scene';

export const handleCallbackQuery = async (ctx: TelegrafContext) => {
  const data = ctx.callbackQuery.data as string;
  if (data.startsWith('view_request_')) {
    const requestId = +data.split('_')[2];
    ctx.scene.session.previousScene = ctx.scene.current;
    await ctx.answerCbQuery();
    await ctx.scene.enter(VIEW_REQUEST_SCENE, { requestId });
  }
  if (data === 'start_request') {
    ctx.scene.session.previousScene = ctx.scene.current;
    await ctx.answerCbQuery();
    await ctx.scene.enter(REGISTER_REQUEST_SCENE);
  }
};
