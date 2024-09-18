import type { Context, RepositoryType } from "#root/bot/context.js";
import { Composer } from "grammy";

import { conversations } from "@grammyjs/conversations";
import logger from "#root/logger.js";
import {
  createEditQuestionConversation,
  createQuestionConversation,
} from "./index.js";

const createConversationFeature = (repositories: RepositoryType) => {
  const composer = new Composer<Context>();

  const feature = composer.errorBoundary((error) => {
    logger.error(error);
  });

  feature.use(conversations());

  feature.use(createQuestionConversation(repositories));
  feature.use(createEditQuestionConversation(repositories));

  return composer;
};

export { createConversationFeature };
