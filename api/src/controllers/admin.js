import Integration from "../models/integration";
import {failOnNonAuth} from "../middleware/auth";

const NAME = "admin";

const noop = i => i;

export const sqlRequest = (sql, getArgs, postProcess = noop) => (request, reply) =>
  request.pg
    .query(sql, getArgs && getArgs(request))
    .then(r => reply(postProcess(r.rows)), r => reply(r).code(400));

const plugin = (server, options, next) => {
  failOnNonAuth(server);

  server.route({
    method: "GET",
    path: "/admin/home",
    handler: (request, reply) =>
      Promise.all([
        Integration.getData(request.pg, Integration.Type.SlackUser, request.userId),
      ]).then(
        ([userData]) =>
          reply({
            me: {
              id: request.userId,
              name: userData.user.name,
              avatar: userData.user.image_72,
            },
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
