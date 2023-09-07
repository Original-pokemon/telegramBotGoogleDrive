import { UserGroup } from '../const.mjs';

export default class UsersRepository {
  constructor(sendQuery) {
    this.sendQuery = sendQuery;
  }

  async getUser(id) {
    const query = `SELECT * FROM "User" WHERE "Id" = '${id}'`;

    const result = await this.sendQuery(query);
    return result.rows[0];
  }

  async getAllUsers() {
    const QUERY = `SELECT * FROM "User";`;
    try {
      const result = await this.sendQuery(QUERY);
      return result.rows;
    } catch (error) {
      throw new Error(
        `Ошибка в получении всех пользователей: \n${error.message}`
      );
    }
  }

  async getAllAzs() {
    const QUERY = `SELECT * FROM "User" WHERE "Group" != '${UserGroup.Admin}' AND "Group" != '${UserGroup.WaitConfirm}';`;
    try {
      const result = await this.sendQuery(QUERY);
      return result.rows;
    } catch (error) {
      throw new Error(
        `Ошибка в получении всех пользователей: \n${error.message}`
      );
    }
  }

  async deleteUser(id) {
    const query = `DELETE FROM "User"
	WHERE "Id" = '${id}';`;
    try {
      const result = await this.sendQuery(query);
      console.log('Successful remove:', result.rowCount);
    } catch (error) {
      throw new Error(`Ошибка в удалении пользователя: \n${error.message}`);
    }
  }

  async addUser(id, Name, Group) {
    const creteQuery = `INSERT INTO "User" ("Id", "Name", "Group") VALUES ('${id}', '${Name}', '${Group}');`;
    try {
      const createResponse = await this.sendQuery(creteQuery);
      const result = await this.getUser(id);
      console.log('Successful add:', createResponse.rowCount);
      return result;
    } catch (error) {
      throw new Error(`Ошибка в добавлении пользователя: \n${error.message}`);
    }
  }

  async updateUser(id, Name, Group, FolderId) {
    const query = `UPDATE "User"
	SET "Name" = '${Name}', "Group" = '${Group}', "UserFolder" = '${FolderId}'
	WHERE "Id" = '${id}';`;

    try {
      const result = await this.sendQuery(query);
      return result;
    } catch (error) {
      throw new Error(
        `Ошибка в обновлении данных пользователя \n${error.message}`
      );
    }
  }
}
