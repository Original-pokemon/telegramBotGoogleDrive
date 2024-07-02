import { sendQuery } from '../postgres-node/sendQuery.mjs';

export async function getAllFolders(client) {
  const query = `SELECT * FROM "PhotoFolder"`;
  const result = await sendQuery(client, query);
  return result.rows;
}

export async function deleteFolder(client,id) {
  const query = `DELETE FROM "PhotoFolder" WHERE "Id" = '${id}';`;
  const result = await sendQuery(client, query);
  console.log('Successful remove:', result.rowCount);
}

export async function addFolder(client,name,path) {
  const query = `INSERT INTO "PhotoFolder" ("Name", "Path") VALUES ('${name}', '${path}');`;
  const result = await sendQuery(client, query);
}

export async function updateFolder(client,id,name,path) {
  const query = `UPDATE "PhotoFolder"
  SET "Name" = '${name}', "Path" = '${path}'
  WHERE "Id" = ${id};`;
  const result = await sendQuery(client,query);
  return result;
}

export async function getFolder(client, id) {
  const query = `SELECT * FROM "PhotoFolder" WHERE "Id" = '${id}'`;
  const result = await sendQuery(client, query);
  return result.rows[0];
}
