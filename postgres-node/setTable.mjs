import { Models } from '../models/models.mjs'
import { getClient } from './getClient.mjs'

const tableQuery =
  Models.Group +
  Models.User +
  Models.Question +
  Models.PhotoFolder

export async function createTable() {
  try {
    const client = await getClient()
    const res = await client.query(tableQuery)
    await client.end()
    if (res[0].rowCount) console.log('Created table')
    return res
  } catch (err) {
    throw err
  }
}
