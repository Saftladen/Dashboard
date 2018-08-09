import Integration from "../models/integration";
import PlacementScore from "../models/placement-score";

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
      Promise.all([
        Integration.has(request.pg, Integration.Type.SlackTeam).then(hasSlackTeam => ({
          hasSlackTeam,
        })),
        request.userId
          ? Integration.getData(request.pg, Integration.Type.SlackUser, request.userId).then(
              userData => ({
                me: {
                  id: request.userId,
                  name: userData.user.name,
                  avatar: userData.user.image_72,
                },
              })
            )
          : Promise.resolve({me: null}),
        PlacementScore.getTop(request.pg, 12, !request.userId).then(res => ({placements: res})),
      ]).then(
        results => reply(results.reduce((m, r) => ({...m, ...r}), {})),
        e => console.error(e) || reply({ok: false, error: e}).code(400)
      ),
  });

  next();
};
plugin.attributes = {
  name: NAME,
};
export default plugin;
