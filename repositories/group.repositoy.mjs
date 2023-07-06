export default class GroupRepository {
  constructor(sendQuery) {
    this.sendQuery = sendQuery;
  }

  async getAllGrups() {
    const QUERY = 'SELECT * FROM "Group";';

    const result = await this.sendQuery(QUERY);
    return result;
  }

  async deleteGroup(GroupName) {
    const query = `DELETE FROM "Group"
    WHERE "Name" = '${GroupName}';`;

    const result = await this.sendQuery(query);
    console.log('Successful remove:', result.rowCount);
  }

  async addGroup(GroupName) {
    const query = `INSERT INTO "Group" VALUES ('${GroupName}') ON CONFLICT DO NOTHING;`;

    const result = await this.sendQuery(query);
    if (result.rowCount) console.log('Created group:', GroupName);
    return result;
  }

  async updateGroup(oldName, newName) {
    const query = `UPDATE "Group"
    SET "Name"= '${newName}'
    WHERE "Name" = '${oldName}';`;

    const result = await this.sendQuery(query);
    return result;
  }
}
