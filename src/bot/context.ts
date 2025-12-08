import { type Api, Context as DefaultContext, SessionFlavor } from "grammy";
import type { ParseModeFlavor } from "@grammyjs/parse-mode";
import { Logger } from "#root/logger.js";
import { FileFlavor } from "@grammyjs/files";
import { HydrateFlavor } from "@grammyjs/hydrate";
import { Update, UserFromGetMe } from "grammy/types";
import { Config } from "#root/config.js";
import { GoogleRepositoryType } from "#root/google-drive/index.js";
import { Question, User } from "@prisma/client";
import { ConversationFlavor } from "@grammyjs/conversations";
import QuestionRepository from "./repositories/question.repository.js";
import UsersRepository from "./repositories/user.repository.js";
import PhotoFolderRepository from "./repositories/photo-folder.repository.js";
import GroupRepository from "./repositories/group.repository.js";
import { AnswerType } from "./types/answer.js";

export type MemorySessionData = {
  isAdmin: boolean;
  user: User;
};

export type ExternalSessionData = {
  scene: string;
  answers: (AnswerType | undefined)[];
  questions: Question[];
  customData: { [key: string]: unknown };
  newsletterText?: string;
  editRoleId?: string;
  newRoleId?: string;
};

export type SessionData = {
  memory: MemorySessionData;
  external: ExternalSessionData;
};

export type RepositoryType = {
  googleDrive: GoogleRepositoryType;
  users: UsersRepository;
  groups: GroupRepository;
  questions: QuestionRepository;
  photoFolders: PhotoFolderRepository;
};

type ExtendedContextFlavor = {
  logger: Logger;
  repositories: RepositoryType;
  config: Config;
};

export type Context = ParseModeFlavor<
  FileFlavor<
    HydrateFlavor<
      DefaultContext &
        ExtendedContextFlavor &
        SessionFlavor<SessionData> &
        ConversationFlavor
    >
  >
>;

interface Dependencies {
  logger: Logger;
  repositories: RepositoryType;
  config: Config;
}

export function createContextConstructor({
  logger,
  repositories,
  config,
}: Dependencies) {
  return class extends DefaultContext implements ExtendedContextFlavor {
    logger: Logger;

    repositories: RepositoryType;

    config: Config;

    constructor(update: Update, api: Api, me: UserFromGetMe) {
      super(update, api, me);

      this.logger = logger.child({
        update_id: this.update.update_id,
      });

      this.repositories = repositories;

      this.config = config;
    }
  } as unknown as new (update: Update, api: Api, me: UserFromGetMe) => Context;
}
