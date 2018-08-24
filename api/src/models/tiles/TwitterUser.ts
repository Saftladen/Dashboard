import {GraphQLInt, GraphQLNonNull, GraphQLString} from "graphql";
import {AnyType} from "../../graphql-helper";
import Axios from "axios";
import * as qs from "qs";
import generateTileModel, {FieldsWithValues} from "./generator";

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

export const findLastTweet = async (username: string) => {
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

const modifyData = async (fields: FieldsWithValues) => {
  fields.last_tweet_data = await findLastTweet(fields.username);
  return fields;
};

const {Type: TwitterUser, mutations} = generateTileModel({
  name: "TwitterUser",
  tableName: "twitter_users",
  placementFk: "twitter_user_id",
  placementType: "twitter_user",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    username: {
      editable: true,
      type: new GraphQLNonNull(GraphQLString),
    },
    lastTweetData: {
      sqlColumn: "last_tweet_data",
      type: AnyType,
    },
  },
  modifiyInsert: modifyData,
  modifiyUpdate: modifyData,
});

export {TwitterUser, mutations};
