import { sendQuery } from '../postgres-node/sendQuery.mjs'

export async function getAllFolders(client) {
  const query = ''
  try {
    await sendQuery(client, query)
  } catch (err) {
    throw err
  }
}

export async function deleteFolder(client) {
  const query = ''
  try {
    await sendQuery(client, query)
  } catch (err) {
    throw err
  }
}

export async function addFolder(client) {
  const query = ''
  try {
    await sendQuery(client, query)
  } catch (err) {
    throw err
  }
}
