import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
  GraphQLFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLBoolean,
} from "graphql";
import {createMutation, AnyType} from "../../graphql-helper";
import Axios from "axios";
import * as qs from "qs";

export const TwitterUser = new GraphQLObjectType({
  name: "TwitterUser",
  sqlTable: "twitter_users",
  uniqueKey: "id",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    username: {
      type: new GraphQLNonNull(GraphQLString),
    },
    lastTweetData: {
      sqlColumn: "last_tweet_data",
      type: AnyType,
    },
  }),
});

let cachedToken: string | null = null;
const twitterApiErrorHandler = (e: any) => {
  if (e.response.data && e.response.data.errors) {
    return Promise.reject(
      new Error(e.response.data.errors.map((ie: any) => ie.message).join(" & "))
    );
  }
  return Promise.reject(e);
};

const getBearerToken = async () => {
  if (cachedToken) return cachedToken;
  if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET) {
    throw new Error("No twitter credentials given.");
  }
  let tokenCredentials = `${encodeURIComponent(
    process.env.TWITTER_CONSUMER_KEY
  )}:${encodeURIComponent(process.env.TWITTER_CONSUMER_SECRET)}`;
  tokenCredentials = Buffer.from(tokenCredentials).toString("base64");
  const {data} = await Axios.post(
    "https://api.twitter.com/oauth2/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${tokenCredentials}`,
        "User-Agent": "Saftboard",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Accept-Encoding": "gzip",
      },
    }
  ).catch(twitterApiErrorHandler);
  cachedToken = data.access_token;
  return cachedToken;
};

const findLastTweet = async (username: string) => {
  const token = await getBearerToken();
  const query = qs.stringify({
    count: 1,
    screen_name: username,
    exclude_replies: true,
    include_rts: false,
    tweet_mode: "extended",
  });
  const {data} = await Axios.get(
    `https://api.twitter.com/1.1/statuses/user_timeline.json?${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Saftboard",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Accept-Encoding": "gzip",
      },
    }
  ).catch(twitterApiErrorHandler);
  return data.length ? data[0] : null;
};

export const mutations: GraphQLFieldConfigMap<any, any> = {
  addTwitterUser: createMutation(
    TwitterUser,
    new GraphQLInputObjectType({
      name: "AddTwitterUserInput",
      fields: {
        username: {type: new GraphQLNonNull(GraphQLString)},
        isPrivate: {type: new GraphQLNonNull(GraphQLBoolean)},
      },
    }),
    async (input, ctx) => {
      const {
        rows: [twitterUser],
      } = await ctx.db(
        "insert into twitter_users (username, last_tweet_data, creator_id) VALUES ($1, $2, $3) returning *",
        [input.username, await findLastTweet(input.username), ctx.currentUserId]
      );
      await ctx.db(
        "insert into placement_scores (score, decay_rate, constant_until, is_private, creator_id, twitter_user_id, type) VALUES ($1, $2, now(), $3, $4, $5, $6) returning id",
        [10, 0.05, input.isPrivate, ctx.currentUserId, twitterUser.id, "twitter_user"]
      );
      return twitterUser;
    }
  ),
  updateTwitterUser: createMutation(
    TwitterUser,
    new GraphQLInputObjectType({
      name: "UpdateTwitterUserInput",
      fields: {
        id: {type: new GraphQLNonNull(GraphQLInt)},
        username: {type: new GraphQLNonNull(GraphQLString)},
      },
    }),
    async (input, ctx) => {
      const {
        rows: [twitterUser],
      } = await ctx.db(
        "update twitter_users set username=$2, last_tweet_data=$3 where id=$1 returning *",
        [input.id, input.username, await findLastTweet(input.username)]
      );
      await ctx.db("update placement_scores set constant_until=now() where twitter_user_id=$1", [
        input.id,
      ]);
      return twitterUser;
    }
  ),
  deleteTwitterUser: createMutation(
    TwitterUser,
    new GraphQLInputObjectType({
      name: "DeleteTwitterUserInput",
      fields: {
        id: {type: new GraphQLNonNull(GraphQLInt)},
      },
    }),
    async (input, ctx) => {
      await ctx.db("delete from placement_scores where twitter_user_id=$1", [input.id]);
      const {rows} = await ctx.db("delete from twitter_users where id=$1 returning *", [input.id]);
      return rows[0];
    }
  ),
};
