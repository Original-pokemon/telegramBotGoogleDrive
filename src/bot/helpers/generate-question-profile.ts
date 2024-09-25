export function generateQuestionProfileText(question: {
  id: number;
  name: string;
  text: string;
  require: boolean;
  group: { id: string }[];
}): string {
  const { id, name, text, require, group } = question;

  return `Вопрос №${id}\n
Название вопроса: ${name}\n
Текст вопроса: ${text}\n
Для каких АЗС: ${group.map((g) => g.id).join(" ")}\n
Кнопка "Отсутствует": ${require === true ? "Нету" : "Есть"}`;
}
