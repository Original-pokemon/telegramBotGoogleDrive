// @ts-check
import pg from 'pg';
import { config } from '../config.js';

const { Client } = pg;

/**
 * @returns {Promise<import('pg').Client>}
 */
export default async function getClient() {
  try {
    const client = new Client(config.DATABASE_URL);

    await client.connect();

    return client;
  } catch (error_) {
    const error = new Error(
      `Проблема с подключением к базе \n Ошибка: ${error_.message}`
    );
    throw error;
  }
}
