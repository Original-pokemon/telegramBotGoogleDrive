import getClient from './get-client.mjs';

const CREATE_SHEMA_QUERY = `
CREATE SCHEMA IF NOT EXISTS "googleTelegram_bot"
    AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA "googleTelegram_bot"
    IS 'standard public schema';

GRANT USAGE ON SCHEMA "googleTelegram_bot" TO PUBLIC;

GRANT ALL ON SCHEMA "googleTelegram_bot" TO pg_database_owner;
`;

export default async function createSchema() {
  const client = await getClient();

  const result = await client.query(CREATE_SHEMA_QUERY);
  await client.end();
  if (result[0].rowCount) console.log('Created schema');
  return result;
}
