import retry from 'async-retry';
import dayjs from 'dayjs';

import { options } from './variables.mjs';

const dateOverdue = (messageDate) =>
  messageDate && dayjs().isAfter(messageDate);

const deleteMessage = async (context) => {
  try {
    const messageDate =
      context.update.message?.date ||
      context.update.callback_query?.message.date;
    const oneDayMore = dayjs(messageDate * 1000).add(1, 'day');

    if (dateOverdue(oneDayMore)) {
      return true;
    }

    await retry(async () => {
      await context.deleteMessage();
    }, options);

    return true;
  } catch (error) {
    console.error(`Error in delete func: ${error}`);
    return false;
  }
};

export { dateOverdue, deleteMessage };
