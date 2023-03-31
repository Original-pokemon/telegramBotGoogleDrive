import { getClient } from './getClient.mjs'

export async function sendQuery(insertQuery) {
  const client = await getClient()
  try {
    const res = await client.query(insertQuery)
    await client.end()
    return res
  } catch (err) {
    throw err
  }
}
