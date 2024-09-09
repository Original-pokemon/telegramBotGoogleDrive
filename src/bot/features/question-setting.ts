import { Composer } from 'grammy';
import { Context } from '../context.js';
import { addQuestionCallback, deleteQuestionData, editPanelPanelData, questionProfileData, showAllQuestions } from '../callback-data/index.js';
import { addQuestion, deleteQuestion, questionPanel, questionProfile, showQuestionList } from '../services/question/index.js';
import { EDIT_QUESTION_CONVERSATION } from '../conversations/index.js';
import { logHandle } from '../helpers/logging.js';

const QUESTION_BUTTON = 'Настроить вопросы'
const composer = new Composer<Context>();
const feature = composer.chatType('private').filter(({ session }) => session.memory.isAdmin);

feature.callbackQuery(showAllQuestions, logHandle('callback-query-show-questions'), showQuestionList);
feature.callbackQuery(questionProfileData.filter(), logHandle('callback-query-question-profile'), questionProfile);
feature.callbackQuery(addQuestionCallback, logHandle('callback-query-add-question'), addQuestion);
feature.callbackQuery(deleteQuestionData.filter(), logHandle('callback-query-delete-question'), deleteQuestion);
feature.callbackQuery(editPanelPanelData.filter(), logHandle('callback-query-edit-question'), async (ctx) => await ctx.conversation.enter(EDIT_QUESTION_CONVERSATION));

feature.hears(QUESTION_BUTTON, logHandle('hears-question-panel'), questionPanel);

export { composer as questionSettingFeature }