import Integration from "../models/integration";
import {wrapInTransaction} from "../middleware/psql";
import axios from "axios";

const NAME = "slack";

const plugin = (server, options, next) => {
  wrapInTransaction(server);
  server.route({
    method: "GET",
    path: "/integrations/slack/oauth",
    handler: (request, reply) =>
      axios
        .post(
          "https://slack.com/api/oauth.access",
          {},
          {
            params: {
              client_id: process.env.SLACK_CLIENT_ID,
              client_secret: process.env.SLACK_CLIENT_SECRET,
              code: request.query.code,
            },
          }
        )
        .then(r => (r.data.ok ? Promise.resolve(r.data) : Promise.reject(r.data.error)))
        .then(data => Integration.create(request.pg, Integration.Type.SlackTeam, null, data))
        .then(() => {
          reply.redirect(`${process.env.CLIENT_HOST}/`);
        }, e => console.log("e", e) || reply({ok: false, error: e}).code(400)),
  });

  next();
};
plugin.attributes = {
  name: NAME,
};
export default plugin;
