import Integration from "../models/integration";
import User from "../models/user";
import Token from "../models/token";
import {wrapInTransaction} from "../middleware/psql";
import axios from "axios";
import querystring from "querystring";

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
        .then(
          data =>
            request.query.state === "team"
              ? Integration.create(request.pg, Integration.Type.SlackTeam, null, data).then(
                  () => null
                )
              : Integration.getNoUserData(request.pg, Integration.Type.SlackTeam).then(
                  teamData =>
                    teamData.team_id === data.team.id
                      ? User.createOrUpdate(request.pg, data).then(userId =>
                          Promise.all([
                            Token.create(request.pg, Token.Type.AuthToken, {userId}),
                            Integration.create(
                              request.pg,
                              Integration.Type.SlackUser,
                              userId,
                              data
                            ),
                          ]).then(([authToken]) => ({authToken}))
                        )
                      : Promise.reject(`Only for ${teamData.team_name} members!`)
                )
        )
        .then(data => {
          reply.redirect(`${process.env.CLIENT_HOST}/${data && `?${querystring.stringify(data)}`}`);
        }, e => console.log("e", e) || reply({ok: false, error: e}).code(400)),
  });

  next();
};
plugin.attributes = {
  name: NAME,
};
export default plugin;
