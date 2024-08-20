import getClient from './get-client.mjs';

export default async function sendQuery(insertQuery) {
  const client = await getClient();
  const result = await client.query(insertQuery);
  await client.end();
  return result;
}
