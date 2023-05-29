export default class GroupRepository {
  constructor(sendQuery) {
    this.sendQuery = sendQuery;
  }

  async getAllGrups() {
    const QUERY = 'SELECT * FROM "googleTelegram_bot"."Group";';

    const result = await this.sendQuery(QUERY);
    return result;
  }

  async deleteGroup(GroupName) {
    const query = `DELETE FROM "googleTelegram_bot"."Group"
    WHERE "Name" = '${GroupName}';`;

    const result = await this.sendQuery(query);
    console.log('Successful remove:', result.rowCount);
  }

  async addGroup(GroupName) {
    const query = `INSERT INTO "googleTelegram_bot"."Group" VALUES ('${GroupName}') ON CONFLICT DO NOTHING;`;

    const result = await this.sendQuery(query);
    if (result.rowCount) console.log('Created group:', GroupName);
    return result;
  }

  async updateGroup(oldName, newName) {
    const query = `UPDATE "googleTelegram_bot"."Group"
    SET "Name"= '${newName}'
    WHERE "Name" = '${oldName}';`;

    const result = await this.sendQuery(query);
    return result;
  }
}
