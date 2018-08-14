import {GraphQLObjectType, GraphQLInt, GraphQLNonNull, GraphQLBoolean, GraphQLFloat} from "graphql";
import {Countdown} from "./tiles/Countdown";

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
    countdown: {
      type: Countdown,
      sqlBatch: {
        thisKey: "countdown_id",
        parentKey: "id",
      },
    },
  }),
});
