import Integration from "../models/integration";

const NAME = "getters";

const noop = i => i;

export const sqlRequest = (sql, getArgs, postProcess = noop) => (request, reply) =>
  request.pg
    .query(sql, getArgs && getArgs(request))
    .then(r => reply(postProcess(r.rows)), r => reply(r).code(400));

const plugin = (server, options, next) => {
  server.route({
    method: "GET",
    path: "/public/home",
    handler: (request, reply) =>
      Promise.all([Integration.has(request.pg, Integration.Type.SlackTeam)]).then(
        ([hasSlackTeam]) =>
          reply({
            hasSlackTeam,
          }),
        e => reply({ok: false, error: e}).code(400)
      ),
  });

  next();
};
plugin.attributes = {
  name: NAME,
};
export default plugin;