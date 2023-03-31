import pg from 'pg'

const { Pool } = pg

export async function getClient() {
  try {
    const client = new Pool({
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    })

    return client
  } catch (err) {
    const error = new Error(
      `Проблема с подключением к базе \n Ошибка: ${err.message}`
    )
    throw error
  }
}

