import * as fastify from "fastify";
import {Server, IncomingMessage, ServerResponse} from "http";
import postgraphile from "postgraphile";
import {dbConfig} from "../lib/db-config";
import * as fp from "fastify-plugin";
import {getUserIdFromToken} from "../lib/token";

const graphqlController: fastify.Plugin<Server, IncomingMessage, ServerResponse, {}> = async (
  instance,
  options,
  next
) => {
  instance.use(
    postgraphile(dbConfig, "public", {
      graphiql: process.env.NODE_ENV === "development",
      pgSettings: async (req: any) => {
        const token = req.headers["x-auth-token"];
        console.log("token", token);
        const res = await getUserIdFromToken(req.db, token);
        return {
          role: res.ok ? "member" : "guest",
          "request.user_id": res.ok ? res.data.userId : null, // req.meId
        };
      },
    })
  );

  if (next) next();
};

export default fp(graphqlController);
