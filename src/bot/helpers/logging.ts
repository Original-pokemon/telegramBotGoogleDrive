import type { Context } from "#root/bot/context.js";
import { Middleware } from "grammy";

import type { Update } from "@grammyjs/types";

export function getUpdateInfo(ctx: Context): Omit<Update, "update_id"> {
  const { ...update } = ctx.update;

  return update;
}

export function logHandle(id: string): Middleware<Context> {
  return async (ctx, next) => {
    const { user } = ctx.session.memory;
    const startTime = performance.now();

    try {
      await next();
    } finally {
      const endTime = performance.now();
      ctx.logger.info({
        msg: `handle ${id}`,
        ...(id.startsWith("unhandled")
          ? { update: getUpdateInfo(ctx) }
          : {
              user_id: user?.id,
              user: user.name,
              duration: endTime - startTime,
            }),
      });
    }
  };
}
