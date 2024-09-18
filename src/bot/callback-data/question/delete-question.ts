import { createCallbackData } from "callback-data";

export const deleteQuestionData = createCallbackData("delete_question", {
  questionId: Number,
});
