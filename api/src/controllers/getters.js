import Token from "../models/token";

const NAME = "getters";

const noop = i => i;

export const sqlRequest = (sql, getArgs, postProcess = noop) => (request, reply) =>
  request.pg
    .query(sql, getArgs && getArgs(request))
    .then(r => reply(postProcess(r.rows)), r => reply(r).code(400));

const plugin = (server, options, next) => {
  server.route({
    method: "GET",
    path: "/some-path",
    handler: sqlRequest(`select * from users`),
  });

  next();
};
plugin.attributes = {
  name: NAME,
};
export default plugin;
