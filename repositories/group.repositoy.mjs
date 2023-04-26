import { sendQuery } from '../postgres-node/sendQuery.mjs'

export class GroupRepository {
  async getAllGrups() {
    const QUERY = 'SELECT * FROM "googleTelegram_bot"."Group";'
    try {
      const res = await sendQuery(QUERY)
      return res
    } catch (err) {
      throw err
    }
  }

  async deleteGroup(GroupName) {
    const query = `DELETE FROM "googleTelegram_bot"."Group"
    WHERE "Name" = '${GroupName}';`
    try {
      const res = await sendQuery(query)
      console.log('Successful remove:', res.rowCount)
    } catch (err) {
      throw err
    }
  }

  async addGroup(GroupName) {
    const query = `INSERT INTO "googleTelegram_bot"."Group" VALUES ('${GroupName}') ON CONFLICT DO NOTHING;`
    try {
      const res = await sendQuery(query)
      if (res.rowCount) console.log('Created group:', GroupName)
      return res
    } catch (err) {
      throw err
    }
  }

  async updateGroup(oldName, newName) {
    const query = `UPDATE "googleTelegram_bot"."Group"
    SET "Name"= '${newName}'
    WHERE "Name" = '${oldName}';`
    try {
      const res = await sendQuery(query)
      return res
    } catch (err) {
      throw err
    }
  }
}
