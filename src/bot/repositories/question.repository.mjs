export default class QuestionRepository {
  constructor(sendQuery) {
    this.sendQuery = sendQuery;
  }

  async getQuestion(Id) {
    const query = `SELECT * FROM "Question" WHERE "Id" = '${Id}'`;
    const result = await this.sendQuery(query);
    return result.rows[0];
  }

  /**
   * Получить все вопросы для определнной АЗС
   * @param {string} azsType Тип азс привязка к Group users
   * @returns {object[]} array of questions
   */
  async getQuestions(azsType) {
    const query = `SELECT * FROM "Question"  where '${azsType}' = ANY ("Group")`;
    const result = await this.sendQuery(query);
    return result.rows;
  }

  async getAllQuestions() {
    const QUERY = `SELECT * FROM "Question"`;
    const result = await this.sendQuery(QUERY);
    return result.rows;
  }

  async deleteQuestion(id) {
    const query = `DELETE FROM "Question"
	WHERE "Id" = '${id}';`;
    const result = await this.sendQuery(query);
    console.log('Successful remove:', result.rowCount);
  }

  /**
   *
   * @param {string} name short name for question
   * @param {string} text Full text of the question
   * @param {string[]} group
   * @param {boolean} require
   */
  async addQuestion(name, text, group, require) {
    const query = `INSERT INTO "Question" ("Name", "Text", "Group", "Require") VALUES ('${name}', '${text}', '{${group}}', ${require});`;
    const result = await this.sendQuery(query);
    console.log('Successful add:', result.rowCount);
  }

  async updateQuestion(id, name, text, group, require) {
    const query = `UPDATE "Question"
	SET "Name" = '${name}', "Group" = '{${group}}', "Text" = '${text}', "Require" = ${require}
	WHERE "Id" = ${id};`;
    await this.sendQuery(query);
  }
}
