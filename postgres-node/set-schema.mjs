import getClient from './get-client.mjs';

const CREATE_SHEMA_QUERY = `
CREATE SCHEMA IF NOT EXISTS "${process.env.PG_USER}"
    AUTHORIZATION pg_database_owner;

GRANT USAGE ON SCHEMA "${process.env.PG_USER}" TO PUBLIC;

GRANT ALL ON SCHEMA "${process.env.PG_USER}" TO pg_database_owner;
`;

export default async function createSchema() {
  const client = await getClient();

  const result = await client.query(CREATE_SHEMA_QUERY);
  await client.end();
  if (result[0].rowCount) console.log('Created schema');
  return result;
}
