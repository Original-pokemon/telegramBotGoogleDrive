import retry from 'async-retry';

import { options } from './variables.mjs';

const debounce = (callback, timeoutDelay = 500) => {
  let timeoutId;

  return (...rest) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => callback.apply(this, rest), timeoutDelay);
  };
}

const deleteMessage = async (context) => {
  try {
    await retry(async () => await context.deleteMessage(), options);
  } catch (error) {
    console.error(`Error in delete func: ${error}`);
  }
}

export { debounce, deleteMessage };