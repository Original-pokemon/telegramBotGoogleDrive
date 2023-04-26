const debounce = (callback, timeoutDelay = 500) => {
  let timeoutId;

  return (...rest) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => callback.apply(this, rest), timeoutDelay);
  };
}

const deleteMessage = async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (err) {
  }
}

export { debounce, deleteMessage }