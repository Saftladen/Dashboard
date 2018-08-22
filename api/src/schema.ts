import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql";
import {mutations as countdownMutations} from "./models/tiles/Countdown";
import {mutations as mediaMutations} from "./models/tiles/Media";
import {mutations as twitterUserMutations} from "./models/tiles/TwitterUser";

import {TeamIntegration} from "./models/Integration";
import {TopPlacements} from "./models/Placements";
import {User} from "./models/User";
import {monsterResolver, defaultQueryDbFn} from "./graphql-helper";
import asyncify from "callback-to-async-iterator";
import {PoolClient, Client} from "pg";

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
    ...twitterUserMutations,
  },
});

const ChangeType = new GraphQLObjectType({
  name: "Change",
  fields: {
    ok: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
  },
});

let isListeningActive = false;

const getSubscription = (client: PoolClient | Client) => {
  const listenToChanges = async (cb: (a: any) => any) => {
    if (!isListeningActive) {
      await client.query('LISTEN "changed"');
      isListeningActive = true;
    }
    client.on("notification", payload => cb({ok: true}));
    return {ready: true};
  };
  return new GraphQLObjectType({
    name: "Subscription",
    fields: {
      dataChanged: {
        type: ChangeType,
        subscribe: () => asyncify(listenToChanges),
      },
    },
  });
};
const getSchema = async (client: PoolClient | Client) =>
  new GraphQLSchema({
    query: QueryRoot,
    mutation: Mutations,
    subscription: await getSubscription(client),
  });

export default getSchema;
