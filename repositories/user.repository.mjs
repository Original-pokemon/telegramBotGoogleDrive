import { sendQuery } from '../postgres-node/sendQuery.mjs'

export class UsersRepository {
  async getUser(id) {
    const query = `SELECT * FROM "googleTelegram_bot"."User" WHERE "Id" = '${id}'`
    try {
      const res = await sendQuery(query)
      return res.rows[0]
    } catch (err) {
      throw new Error('Ошибка в получении пользователя: \n' + err.message)
    }
  }

  async getAllUsers() {
    const QUERY = `SELECT * FROM "googleTelegram_bot"."User";`
    try {
      const res = await sendQuery(QUERY)
      return res.rows
    } catch (err) {
      throw new Error('Ошибка в получении всех пользователей: \n' + err.message)
    }
  }

  async getAllAzs() {
    const QUERY = `SELECT * FROM "googleTelegram_bot"."User" WHERE "Group" != 'admin' AND "Group" != 'waitConfirm';`
    try {
      const res = await sendQuery(QUERY)
      return res.rows
    } catch (err) {
      throw new Error('Ошибка в получении всех пользователей: \n' + err.message)
    }
  }

  async deleteUser(id) {
    const query = `DELETE FROM "googleTelegram_bot"."User"
	WHERE "Id" = '${id}';`
    try {
      const res = await sendQuery(query)
      console.log('Successful remove:', res.rowCount)
    } catch (err) {
      throw new Error('Ошибка в удалении пользователя: \n' + err.message)
    }
  }

  async addUser(id, Name, Group) {
    const creteQuery = `INSERT INTO "googleTelegram_bot"."User" ("Id", "Name", "Group") VALUES ('${id}', '${Name}', '${Group}');`
    const getQuery = `SELECT * FROM "googleTelegram_bot"."User" WHERE "Id" = '${id}'`
    try {
      const createRes = await sendQuery(creteQuery)
      const getRes = await sendQuery(getQuery)
      console.log('Successful add:', createRes.rowCount)
      return getRes.rows[0]
    } catch (err) {
      throw new Error('Ошибка в добавлении пользователя: \n' + err.message)
    }
  }

  async updateUser(id, Name, Group, FolderId) {
    const query = `UPDATE "googleTelegram_bot"."User"
	SET "Name" = '${Name}', "Group" = '${Group}', "UserFolder" = '${FolderId}'
	WHERE "Id" = '${id}';`
    try {
      const res = await sendQuery(query)
      return res
    } catch (err) {
      throw new Error(
        'Ошибка в обновлении данных пользователя \n' + err.message
      )
    }
  }
}
