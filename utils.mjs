import dayjs from 'dayjs';
import { GrammyError } from 'grammy';

/**
 *
 * @param {number} messageDate
 * @returns {boolean} Result on overdue time
 */
const dateOverdue = (messageDate) =>
  messageDate && dayjs().isAfter(messageDate);

/**
 *
 * @param {object} context
 * @returns {Promise<boolean>} Function result
 */
const deleteMessage = async (context) => {
  try {
    const messageDate =
      context.update.message?.date ||
      context.update.callback_query?.message.date;
    const oneDayMore = dayjs(messageDate * 1000).add(1, 'day');

    if (dateOverdue(oneDayMore)) {
      return true;
    }

    await context.deleteMessage();

    return true;
  } catch (error) {
    if (error instanceof GrammyError && error.error_code === '400') {
      return true;
    }

    console.error(`Error in delete func: ${error}`);
    return false;
  }
};

export { dateOverdue, deleteMessage };
