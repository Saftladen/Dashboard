import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLEnumType,
} from "graphql";
import {Countdown} from "./tiles/Countdown";

const PlacementType = new GraphQLEnumType({
  name: "PlacementType",
  values: {
    COUNTDOWN: {value: "countdown"},
    UNASSIGNED: {value: "media"},
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
      sqlBatch: {
        thisKey: "id",
        parentKey: "countdown_id",
      },
    },
  }),
});
