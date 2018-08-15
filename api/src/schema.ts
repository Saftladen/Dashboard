import {GraphQLObjectType, GraphQLSchema, GraphQLNonNull, GraphQLList, GraphQLInt} from "graphql";
import {mutations as countdownMutations} from "./models/tiles/Countdown";
import {mutations as mediaMutations} from "./models/tiles/Media";

import {TeamIntegration} from "./models/Integration";
import {TopPlacements} from "./models/Placements";
import {User} from "./models/User";
import {monsterResolver, defaultQueryDbFn} from "./graphql-helper";

export const QueryRoot = new GraphQLObjectType({
  name: "Query",
  fields: {
    teamIntegration: {
      type: TeamIntegration,
      where: (table, args, context) => `${table}.type = 'slack_team'`,
      resolve: monsterResolver(),
    },
    currentUser: {
      type: User,
      where: (table, args, context) => `${table}.id = ${context.currentUserId}`,
      resolve: monsterResolver(
        ctx => (ctx.currentUserId ? defaultQueryDbFn(ctx) : () => Promise.resolve([]))
      ),
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
      resolve: monsterResolver(),
    },
  },
});

const Mutations = new GraphQLObjectType({
  name: "Mutations",
  fields: {
    ...countdownMutations,
    ...mediaMutations,
  },
});

const schema = new GraphQLSchema({query: QueryRoot, mutation: Mutations});
export default schema;
