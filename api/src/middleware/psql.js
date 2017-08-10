import pg from "pg";
import chalk from "chalk";

export const wrapInTransaction = server => {
  const extConfig = {
    sandbox: "plugin",
    before: [],
    after: [],
    bind: undefined,
  };

  server.ext(
    "onPreHandler",
    (request, reply) => {
      request.pg.query("begin").then(() => reply.continue());
    },
    extConfig
  );

  server.ext(
    "onPreResponse",
    (request, reply) => {
      if (request.pg) {
        if (request.response && request.response.isBoom) {
          console.log("rollback");
          request.pg.query("rollback;").then(() => reply.continue());
        } else {
          request.pg.query("commit;").then(() => reply.continue());
        }
      }
    },
    extConfig
  );
};

const NAME = "pgPlugin";
const plugin = (server, options, next) => {
  server.expose("pool", new pg.Pool(options.pgConnectionConfig));

  server.ext("onPreHandler", (request, reply) => {
    const pool = server.plugins[NAME].pool;
    pool.connect().then(
      client => {
        const orgQuery = client.query;
        client.query = (...args) => {
          const relevantArgs = args.filter(a => typeof a !== "function");
          const interpolationVals = relevantArgs[1];
          const vals = interpolationVals
            ? "\n" +
              interpolationVals
                .map((v, i) => `${chalk.gray(`$${i + 1}:`)} ${chalk.dim(JSON.stringify(v))}`)
                .join("\n")
            : "";
          request.log(["sql"], `\n${chalk.blue(relevantArgs[0])}${vals}`);
          return orgQuery.apply(client, args);
        };
        request.pg = client;
        reply.continue();
      },
      err => {
        reply(err);
      }
    );
  });

  server.on("tail", request => {
    if (request.pg) {
      request.pg.release(err => {
        if (err) console.error(err);
      });
    }
  });

  next();
};
plugin.attributes = {
  name: NAME,
};

export default plugin;
