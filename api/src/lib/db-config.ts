export const dbConfig = {
  host: process.env.PSQL_HOST,
  user: process.env.PSQL_USERNAME,
  port: process.env.PSQL_PORT ? parseInt(process.env.PSQL_PORT as string, 10) : undefined,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
};
