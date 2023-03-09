import { sendQuery } from '../postgres-node/sendQuery.mjs'

export class QuestionRepository {
  async getQuestion(Id) {
    const query = `SELECT * FROM "googleTelegram_bot"."Question" WHERE "Id" = '${Id}'`
    try {
      const res = await sendQuery(query)
      return res.rows[0]
    } catch (err) {
      throw err
    }
  }

  async getQuestions(azs) {
    const сondition = ` WHERE "Group" = 'azs';`
    const query =
      `SELECT * FROM "googleTelegram_bot"."Question"` +
      (azs === 'azs' ? сondition : '')
    try {
      const res = await sendQuery(query)
      return res.rows
    } catch (err) {
      throw err
    }
  }
  async getAllQuestions() {
    const QUERY = `SELECT * FROM "googleTelegram_bot"."Question"`
    try {
      const res = await sendQuery(QUERY)
      return res.rows
    } catch (err) {
      throw err
    }
  }

  async deleteQuestion(id) {
    const query = `DELETE FROM "googleTelegram_bot"."Question"
	WHERE "Id" = '${id}';`
    try {
      const res = await sendQuery(query)
      console.log('Successful remove:', res.rowCount)
    } catch (err) {
      throw err
    }
  }

  async addQuestion(name, text, Group) {
    const query = `INSERT INTO "googleTelegram_bot"."Question" ("Name", "Text", "Group") VALUES ('${name}', '${text}', '${Group}');`
    try {
      const res = await sendQuery(query)
      console.log('Successful add:', res.rowCount)
    } catch (err) {
      throw err
    }
  }

  async updateQuestion(id, name, text, group) {
    const query = `UPDATE "googleTelegram_bot"."Question"
	SET "Name" = '${name}', "Group" = '${group}', "Text" = '${text}'
	WHERE "Id" = '${id}';`
    try {
      await sendQuery(query)
    } catch (err) {
      throw err
    }
  }
}
