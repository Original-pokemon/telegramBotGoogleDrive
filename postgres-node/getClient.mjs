import pg from 'pg'

export async function getClient() {
  const client = new pg.Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  })

  await client.connect((err) => {
    if (err) {
      const error = new Error(
        `Проблема с подключением к базе \n Ошибка: ${err.message}`
      )
      throw error
    }
  })

  return client
}
