import { Models } from '../models/models.mjs'
import { getClient } from './getClient.mjs'

const tableQuery =
  Models.Group +
  Models.User +
  Models.Question +
  Models.PhotoFolder

export async function createTable() {
  const client = await getClient()
  const res = await client.query(tableQuery)
  return res
}
