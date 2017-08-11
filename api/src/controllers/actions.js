import {wrapInTransaction} from "../middleware/psql";

const NAME = "actions";

export const actionHandler = cb => (request, reply) => {
  const retVal = cb(JSON.parse(request.payload), request, reply);
  if (retVal && typeof retVal.then === "function") {
    retVal.then(data => reply(data).code(data.code || 200), e => reply(e).code(400));
  } else {
    reply(retVal || {ok: true}).code(retVal.code || 200);
  }
};

const plugin = (server, options, next) => {
  wrapInTransaction(server);
  server.route({
    method: "POST",
    path: "/action/ACTIONNAME",
    handler: actionHandler((data, request) =>
      request.pg.query(`SQLQUERY ($1, $2)`, [data.field1, data.field2])
    ),
  });

  next();
};
plugin.attributes = {
  name: NAME,
};
export default plugin;
