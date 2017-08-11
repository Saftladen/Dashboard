import {wrapInTransaction} from "../middleware/psql";
import {failOnNonAuth} from "../middleware/auth";
import Countdown from "../models/countdown";
import PlacementScore from "../models/placement-score";

const NAME = "actions";

export const actionHandler = cb => (request, reply) => {
  const retVal = cb(JSON.parse(request.payload), request, reply);
  if (retVal && typeof retVal.then === "function") {
    retVal.then(
      data => reply(data).code(data.code || 200),
      e => reply({ok: false, error: e.message}).code(400)
    );
  } else {
    reply(retVal || {ok: true}).code(retVal.code || 200);
  }
};

const plugin = (server, options, next) => {
  wrapInTransaction(server);
  failOnNonAuth(server);

  server.route({
    method: "POST",
    path: "/action/create-countdown",
    handler: actionHandler((data, request) =>
      Countdown.create(request.pg, data.label, data.endsAt, request.userId).then(countdownId =>
        PlacementScore.create(request.pg, 10, 10, data.endsAt, data.isPrivate, request.userId, {
          countdownId,
        })
      )
    ),
  });

  next();
};
plugin.attributes = {
  name: NAME,
};
export default plugin;
