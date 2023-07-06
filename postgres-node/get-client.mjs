// @ts-check
import pg from 'pg';

const { Client } = pg;

/**
 * @returns {Promise<import('pg').Client>}
 */
export default async function getClient() {
  try {
    const client = new Client({
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    });

    await client.connect();

    return client;
  } catch (error_) {
    const error = new Error(
      `Проблема с подключением к базе \n Ошибка: ${error_.message}`
    );
    throw error;
  }
}
