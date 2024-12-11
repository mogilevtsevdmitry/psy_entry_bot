import { COMPLETE_REQUEST_SCENE } from '@telegram/scenes/complete-request.scene';
import { DECLINE_REQUEST_SCENE } from '@telegram/scenes/decline-request.scene';
import { DELETE_REQUEST_SCENE } from '@telegram/scenes/delete-request.scene';
import { IN_WORK_REQUEST_SCENE } from '@telegram/scenes/in-work-request.scene';
import { REGISTER_REQUEST_SCENE } from '@telegram/scenes/register-request.scene';
import { VIEW_REQUEST_SCENE } from '@telegram/scenes/view-request.scene';
import { ChangeStatusEnum } from '../use-cases/change-status';

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
  if (data.startsWith('change_request_')) {
    ctx.scene.session.previousScene = ctx.scene.current;
    await ctx.answerCbQuery();
    const [_1, _2, action, requestId] = data.split('_');
    switch (action) {
      case ChangeStatusEnum.COMPLETE:
        await ctx.scene.enter(COMPLETE_REQUEST_SCENE, { requestId });
        break;
      case ChangeStatusEnum.DECLINE:
        await ctx.scene.enter(DECLINE_REQUEST_SCENE, { requestId });
        break;
      case ChangeStatusEnum.DELETE:
        await ctx.scene.enter(DELETE_REQUEST_SCENE, { requestId });
        break;
      case ChangeStatusEnum.IN_WORK:
        await ctx.scene.enter(IN_WORK_REQUEST_SCENE, { requestId });
        break;
      default:
        await ctx.reply(`Неизвестное действие: ${action}`);
        break;
    }
  }
};
