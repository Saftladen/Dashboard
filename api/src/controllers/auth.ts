import * as fastify from "fastify";
import {Server, IncomingMessage, ServerResponse} from "http";
import connectPg from "../middlewares/pg";
import axios from "axios";
import {DbClient} from "types";
import {createAuthToken} from "../lib/token";

enum Type {
  SlackTeam = "slack_team",
  SlackUser = "slack_user",
}

const createIntegration = (
  db: DbClient,
  type: Type,
  userId: number | null,
  data: any,
  publicData: any
) =>
  db("insert into integrations (type, user_id, data, public_data) VALUES ($1, $2, $3, $4)", [
    type,
    userId,
    data,
    publicData,
  ]);

const getTeamData = (db: DbClient) =>
  db("select data from integrations where type=$1 and user_id is null", [Type.SlackTeam]).then(
    res => (res.rows.length > 0 ? res.rows[0].data : null)
  );

const createOrUpdateUser = (db: DbClient, data: any) =>
  db(
    "insert into users (name, slack_id) VALUES ($1, $2) on conflict(slack_id) do update set name=excluded.name returning id",
    [data.user.name, data.user.id]
  ).then(result => result.rows[0].id as number);

const authController: fastify.Plugin<Server, IncomingMessage, ServerResponse, {}> = async (
  instance,
  options,
  next
) => {
  connectPg(instance);

  instance.get("/integrations/slack/oauth", async (request, response) => {
    const {data} = await axios.post(
      "https://slack.com/api/oauth.access",
      {},
      {
        params: {
          client_id: process.env.SLACK_CLIENT_ID,
          client_secret: process.env.SLACK_CLIENT_SECRET,
          code: request.query.code,
        },
      }
    );
    if (data.ok) {
      if (request.query.state === "team") {
        await createIntegration(request.db, Type.SlackTeam, null, data, {teamName: data.team_name});
      } else {
        const teamData = await getTeamData(request.db);
        if (teamData === data.team.id) {
          const userId = await createOrUpdateUser(request.db, data);
          const [authToken] = await Promise.all([
            createAuthToken(request.db, userId),
            createIntegration(request.db, Type.SlackUser, userId, data, {}),
          ]);
          return {authToken};
        } else {
          return Promise.reject({status: 403, error: `Only for ${teamData.team_name} members!`});
        }
      }
      return response.redirect(303, `${process.env.CLIENT_HOST}/`);
    } else {
      return Promise.reject({status: 500, error: data.error});
    }
  });

  if (next) next();
};

export default authController;
