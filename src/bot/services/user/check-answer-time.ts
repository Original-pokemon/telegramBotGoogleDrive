import { HearsContext } from "grammy";
import { Context } from "#root/bot/context.js";

export const checkAnswerTime = ({ session, msg }: HearsContext<Context>): boolean => {
  const { lastMessageDate } = session.external.customData;

  if (typeof lastMessageDate === 'number') {
    const timeDifference = msg.date - lastMessageDate;
    return timeDifference > 5 * 60; // Проверка, прошло ли более 5 минут
  }

  return false; // Если lastMessageDate не число, возвращаем false
};
