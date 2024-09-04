import { Composer } from 'grammy';
import { Context } from '../context.js';
import { addQuestionCallback, deleteQuestionData, editPanelPanelData, questionProfileData, showAllQuestions } from '../callback-data/index.js';
import { addQuestion, deleteQuestion, questionPanel, questionProfile, showQuestionList } from '../services/question/index.js';
import { EDIT_QUESTION_CONVERSATION } from '../conversations/index.js';

const QUESTION_BUTTON = 'Настроить вопросы'
const composer = new Composer<Context>();
const feature = composer.chatType('private').filter(({ session }) => session.memory.isAdmin);

feature.callbackQuery(showAllQuestions, showQuestionList);
feature.callbackQuery(questionProfileData.filter(), questionProfile);
feature.callbackQuery(addQuestionCallback, addQuestion);
feature.callbackQuery(deleteQuestionData.filter(), deleteQuestion);
feature.callbackQuery(editPanelPanelData.filter(), async (ctx) => await ctx.conversation.enter(EDIT_QUESTION_CONVERSATION));

feature.hears(QUESTION_BUTTON, questionPanel);

export { composer as questionSettingFeature }