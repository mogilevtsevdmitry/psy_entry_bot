import { ConfigService } from '@core/config.service';
import { PrismaClient } from '@prisma/client';
import redis from '@redis';
import { messages } from '@telegram/constants';
import { formatPhone } from '@telegram/utils/format-phone.util';
import { Scenes } from 'telegraf';
import { message } from 'telegraf/filters';

export const REGISTER_REQUEST_SCENE = 'registerRequest';

enum StepEnum {
  NAME = 'name',
  PHONE = 'phone',
  REQUEST = 'request',
}

interface IStep {
  question: string;
  answer?: string;
  error?: string;
}

interface IUserState {
  step: StepEnum;
  [key: string]: any;
}

const steps: Record<StepEnum, IStep> = {
  [StepEnum.NAME]: {
    question: 'Как я могу к вам обращаться?',
    error: '❌ Не верно задано имя. Введите имя русскими буквами.',
  },
  [StepEnum.PHONE]: {
    question: 'Укажите контактный номер телефона в формате 7 999 888 77 66',
    error:
      '❌ Вы указали неверный номер телефона. Введите телефон в формате 7 999 888 77 66.',
  },
  [StepEnum.REQUEST]: {
    question: 'Изложите кратко суть запроса.',
    error: '❌ Укажите ваш запрос.',
  },
};

const registerRequestScene = new Scenes.BaseScene<TelegrafContext>(
  REGISTER_REQUEST_SCENE
);

const getUserState = async (userId: number): Promise<IUserState | null> => {
  const data = await redis.get(`user:${userId}:state`);
  return data ? JSON.parse(data) : null;
};

const setUserState = async (userId: number, state: any) => {
  await redis.set(`user:${userId}:state`, JSON.stringify(state));
};

const clearUserState = async (userId: number) => {
  await redis.del(`user:${userId}:state`);
};

registerRequestScene.enter(async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = (await getUserState(userId)) || { step: StepEnum.NAME };
  await setUserState(userId, state);

  const currentStep = state.step;
  await ctx.reply(steps[currentStep].question);
});

// Обработчик сообщений
registerRequestScene.on(message('text'), async (ctx) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) return;

    const state = await getUserState(userId);
    if (!state) return ctx.scene.enter(REGISTER_REQUEST_SCENE); // Если состояние отсутствует, перезапускаем сцену

    const currentStep = state.step as StepEnum;
    const userMessage = ctx.message.text.trim();

    // Обработка шагов
    switch (currentStep) {
      case StepEnum.NAME:
        if (/^[А-Яа-яЁё\s]+$/.test(userMessage)) {
          state[StepEnum.NAME] = userMessage;
          state.step = StepEnum.PHONE;
          await setUserState(userId, state);
          await ctx.reply(steps[StepEnum.PHONE].question);
        } else {
          await ctx.reply(steps[StepEnum.NAME].error as string);
        }
        break;

      case StepEnum.PHONE:
        const phonePattern = /^7\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/;
        if (phonePattern.test(userMessage.replace(/\s+/g, ''))) {
          state[StepEnum.PHONE] = Number(formatPhone(userMessage));
          state.step = StepEnum.REQUEST;
          await setUserState(userId, state);
          await ctx.reply(steps[StepEnum.REQUEST].question);
        } else {
          await ctx.reply(steps[StepEnum.PHONE].error as string);
        }
        break;

      case StepEnum.REQUEST:
        if (userMessage.length > 0) {
          state[StepEnum.REQUEST] = userMessage;
          await ctx.reply(
            '✅ Ваша заявка принята. В скором времени мы с вами свяжемся.'
          );

          // Сохранение данных в базу
          const prisma = new PrismaClient();
          let user = await prisma.user
            .findUnique({
              where: { telegramId: ctx.from.id },
            })
            .catch((err) => {
              console.error(err);
              return null;
            });
          if (!user) {
            user = await prisma.user.create({
              data: {
                phone: BigInt(Number(formatPhone(state[StepEnum.PHONE]))),
                isBot: ctx.from?.is_bot,
                isPremium: ctx.from?.is_premium || false,
                telegramId: ctx.from?.id,
                firstName: ctx.from?.first_name,
                lastName: ctx.from?.last_name,
                languageCode: ctx.from?.language_code,
                username: ctx.from?.username,
              },
            });
          }
          const request = await prisma.request.create({
            data: {
              name: state[StepEnum.NAME],
              request: state[StepEnum.REQUEST],
              status: 'ACTIVE',
              user: {
                connect: { id: user.id },
              },
            },
            include: { user: true },
          });

          // Очистка состояния
          await clearUserState(userId);

          const configService = new ConfigService();
          const adminId = configService.adminId;
          await ctx.telegram.sendMessage(
            adminId,
            messages.newRequest(request),
            {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Перейти в чат',
                      url: `https://t.me/${ctx.from.username}`,
                    },
                  ],
                ],
              },
            }
          );
          await ctx.scene.leave();
        } else {
          await ctx.reply(steps[StepEnum.REQUEST].error as string);
        }
        break;

      default:
        await ctx.reply('Что-то пошло не так. Попробуйте ещё раз.');
        await ctx.scene.leave();
        break;
    }
  } catch (error) {
    console.error(error);
    await ctx.reply('Что-то пошло не так. Попробуйте ещё раз.');
    await ctx.scene.leave();
  }
});

// registerRequestScene.leave(async (ctx) => {
//   await ctx.reply('Регистрация завершена.');
// });

export default registerRequestScene;
