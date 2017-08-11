require("dotenv").config({path: path.join(__dirname, "..", ".env")});

import Hapi from "hapi";
import Good from "good";
import path from "path";
import auth from "./middleware/auth";
import psql from "./middleware/psql";
import actionRoutes from "./controllers/actions";
import getterRoutes from "./controllers/getters";
import slackRoutes from "./controllers/slack";

const server = new Hapi.Server({debug: {request: ["error", "uncaught"]}});
server.connection({
  port: 4000,
  host: "localhost",
  routes: {
    cors: {
      additionalHeaders: ["x-auth-token"],
    },
  },
});

const pgConnectionConfig = {
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  user: process.env.PSQL_USERNAME,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT ? parseInt(process.env.PSQL_PORT, 10) : 5432,
};

server.register(
  [
    {
      register: psql,
      options: {
        pgConnectionConfig,
      },
    },
    auth,
    actionRoutes,
    getterRoutes,
    slackRoutes,
    {
      register: Good,
      options: {
        reporters: {
          console: [
            {
              module: "good-console",
            },
            "stdout",
          ],
        },
      },
    },
  ],
  err => {
    if (err) throw err;
  }
);

server.start(err => {
  if (err) throw err;
  server.log("info", "Server running at: " + server.info.uri);
});
