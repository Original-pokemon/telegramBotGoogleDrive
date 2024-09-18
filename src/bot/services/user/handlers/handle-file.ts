import { Options } from "#root/bot/const.js";
import { Context } from "#root/bot/context.js";
import retry from "async-retry";

export const handleFile = async (ctx: Context) => {
  ctx.logger.trace("Starting file handling process.");

  try {
    const file = await retry(async () => {
      ctx.logger.debug("Attempting to retrieve file.");
      const result = await ctx.getFile();
      ctx.logger.debug("File retrieved successfully.");
      return result;
    }, Options);

    if (!file) {
      ctx.logger.warn(`File not found for context: ${JSON.stringify(ctx)}`);
      throw new Error(`File not found: ${ctx}`);
    }

    ctx.logger.debug("File handling completed successfully.");
    return file;
  } catch (error) {
    if (error instanceof Error) {
      ctx.logger.error(`Error while handling file: ${error.message}`);
      throw error;
    } else {
      ctx.logger.error("Unknown error occurred while handling file");
      throw new Error("An unknown error occurred");
    }
  }
};
