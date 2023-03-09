import { getClient } from './getClient.mjs'

const CREATE_SHEMA_QUERY = `
CREATE SCHEMA IF NOT EXISTS "googleTelegram_bot"
    AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA "googleTelegram_bot"
    IS 'standard public schema';

GRANT USAGE ON SCHEMA "googleTelegram_bot" TO PUBLIC;

GRANT ALL ON SCHEMA "googleTelegram_bot" TO pg_database_owner;
`

export async function createSchema() {
  const client = await getClient()

  const res = await client.query(CREATE_SHEMA_QUERY)
  return res
}
