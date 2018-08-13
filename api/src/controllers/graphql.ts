import * as fastify from "fastify";
import {Server, IncomingMessage, ServerResponse} from "http";
import {getUserIdFromToken} from "../lib/token";
import joinMonster from "join-monster";
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLFieldResolver,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} from "graphql";
const graphqlHTTP = require("express-graphql");
const fpPlugin = require("fastify-plugin");
import {TeamIntegration} from "../models/Integration";
import {DbClient} from "types";
import {enhancedQuery} from "../lib/query-logger";
import {TopPlacements} from "../models/Placements";

const monsterResolver: GraphQLFieldResolver<any, {db: DbClient; currentUserId: number | null}> = (
  parent,
  args,
  context,
  resolveInfo
) => {
  return joinMonster(
    resolveInfo,
    {currentUserId: context.currentUserId},
    async (sql: string) => {
      return (await context.db(sql)).rows;
    },
    {dialect: "pg"}
  );
};

export const QueryRoot = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    teamIntegration: {
      type: TeamIntegration,
      where: (table, args, context) => `${table}.type = 'slack_team'`,
      resolve: monsterResolver,
    },
    topPlacements: {
      type: new GraphQLNonNull(new GraphQLList(TopPlacements)),
      args: {
        first: {
          description: "Limit the number of results",
          type: GraphQLInt,
        },
      },
      limit: args => args.first,
      where: (table, args, context) =>
        context.currentUserId ? undefined : `not ${table}.is_private`,
      orderBy: {current_score: "desc"},
      resolve: monsterResolver,
    },
  }),
});

const schema = new GraphQLSchema({query: QueryRoot});

const graphqlController: fastify.Plugin<Server, IncomingMessage, ServerResponse, {}> = async (
  instance,
  options,
  next
) => {
  instance.use(
    "/graphql",
    graphqlHTTP(async (req: any) => {
      const auth = await getUserIdFromToken(instance.pg.query, req.headers["x-auth-token"]);
      const context = {
        currentUserId: auth.ok ? auth.data.userId : null,
        db: enhancedQuery(console.log, instance.pg.query),
      };
      return {
        schema,
        graphiql: true,
        context,
      };
    })
  );

  if (next) next();
};

export default fpPlugin(graphqlController);
