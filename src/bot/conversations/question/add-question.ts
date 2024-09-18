import { createConversation } from "@grammyjs/conversations";
import { Context, RepositoryType } from "../../context.js";
import { promptForQuestionName } from "./prompts/question-name.js";
import { promptForQuestionRequired } from "./prompts/question-required.js";
import { promptForGroupSelection } from "./prompts/question-group-selection.js";
import { promptForQuestionText } from "./prompts/question-text.js";

export const CREATE_TICKET_CONVERSATION = "create-question";

export const createQuestionConversation = (repositories: RepositoryType) => {
  return createConversation<Context>(async (conversation, ctx) => {
    ctx.repositories = repositories;

    const newQuestion: {
      name: string;
      text: string;
      require: boolean;
      groupIds: string[];
    } = Object.create(null);

    newQuestion.name = await promptForQuestionName(conversation, ctx);
    newQuestion.text = await promptForQuestionText(conversation, ctx);

    const [questionRequired, requireCtx] = await promptForQuestionRequired(
      conversation,
      ctx,
    );
    newQuestion.require = questionRequired;

    requireCtx.repositories = repositories;

    const [groupIds, groupCtx] = await promptForGroupSelection(
      conversation,
      requireCtx,
    );

    newQuestion.groupIds = groupIds;

    await repositories.questions.addQuestion(newQuestion);

    await groupCtx.editMessageText("Вопрос добавлен");
  }, CREATE_TICKET_CONVERSATION);
};
