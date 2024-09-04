import dayjs from 'dayjs';

/**
 *
 * @param {number} messageDate
 * @returns {boolean} Result on overdue time
 */
const dateOverdue = (messageDate: number): boolean =>
  dayjs().isAfter(dayjs(messageDate * 1000));

export { dateOverdue };
