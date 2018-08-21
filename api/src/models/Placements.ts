import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLEnumType,
} from "graphql";
import {Countdown} from "./tiles/Countdown";
import {Media} from "./tiles/Media";
import {TwitterUser} from "./tiles/TwitterUser";

const PlacementType = new GraphQLEnumType({
  name: "PlacementType",
  values: {
    COUNTDOWN: {value: "countdown"},
    MEDIA: {value: "media"},
    TWITTER_USER: {value: "twitter_user"},
  },
});

export const TopPlacements = new GraphQLObjectType({
  name: "TopPlacements",
  sqlTable: "vw_top_placements",
  uniqueKey: "id",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    isPrivate: {
      sqlColumn: "is_private",
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    currentScore: {
      sqlColumn: "current_score",
      type: new GraphQLNonNull(GraphQLFloat),
    },
    type: {
      type: new GraphQLNonNull(PlacementType),
    },
    countdown: {
      type: Countdown,
      sqlJoin: (pt, ot) => `${pt}.countdown_id = ${ot}.id`,
    },
    media: {
      type: Media,
      sqlJoin: (pt, ot) => `${pt}.media_id = ${ot}.id`,
    },
    twitterUser: {
      type: TwitterUser,
      sqlJoin: (pt, ot) => `${pt}.twitter_user_id = ${ot}.id`,
    },
  }),
});
