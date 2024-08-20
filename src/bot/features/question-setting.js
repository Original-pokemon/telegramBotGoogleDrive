export default function questionSettingRoute(
  botInstance,
  router,
  questionPanel,
  showQuestionList,
  questionProfile,
  addQuestion,
  deleteQuestion,
  sendEditMessagePanel,
  redirectUpdateQuestion,
  updateQuestionData
) {
  botInstance.callbackQuery('show_all_questions', showQuestionList);
  botInstance.callbackQuery(/questionId_\d+/, questionProfile);
  botInstance.callbackQuery('add_question', addQuestion);
  botInstance.callbackQuery(/del_question_\d+/, deleteQuestion);
  botInstance.callbackQuery(/edit_question_\d+/, sendEditMessagePanel);
  botInstance.callbackQuery(/update_\w+/, redirectUpdateQuestion);
  botInstance.callbackQuery(/requireAtribute_\w+/, addQuestion);

  botInstance.hears('Настроить вопросы', questionPanel);

  router.route('name', addQuestion);
  router.route('text', addQuestion);
  router.route('updateQuestion_name', updateQuestionData);
  router.route('updateQuestion_text', updateQuestionData);
  router.route('updateQuestion_group', updateQuestionData);
}
