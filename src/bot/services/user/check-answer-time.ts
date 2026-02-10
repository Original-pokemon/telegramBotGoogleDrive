import { HearsContext } from "grammy";
import { Context } from "#root/bot/context.js";

export const checkAnswerTime = ({
  session,
  msg,
}: HearsContext<Context>): boolean => {
  const { lastMessageDate } = session.external.customData;

  if (typeof lastMessageDate === "number") {
    const timeDifference = msg.date - lastMessageDate;
    return timeDifference > 3 * 60 * 60; // Проверка, прошло ли более 3 часов
  }

  return false; // Если lastMessageDate не число, возвращаем false
};
