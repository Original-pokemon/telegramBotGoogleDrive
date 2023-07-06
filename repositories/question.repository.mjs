export default class QuestionRepository {
  constructor(sendQuery) {
    this.sendQuery = sendQuery;
  }

  async getQuestion(Id) {
    const query = `SELECT * FROM "Question" WHERE "Id" = '${Id}'`;
    const result = await this.sendQuery(query);
    return result.rows[0];
  }

  async getQuestions(azs) {
    const query = `SELECT * FROM "Question"  WHERE "Group" = '${azs}' OR "Group" = 'all';`;
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

  async addQuestion(name, text, Group, request) {
    const query = `INSERT INTO "Question" ("Name", "Text", "Group", "Require") VALUES ('${name}', '${text}', '${Group}', ${request});`;
    const result = await this.sendQuery(query);
    console.log('Successful add:', result.rowCount);
  }

  async updateQuestion(id, name, text, group) {
    const query = `UPDATE "Question"
	SET "Name" = '${name}', "Group" = '${group}', "Text" = '${text}'
	WHERE "Id" = '${id}';`;
    await this.sendQuery(query);
  }
}
