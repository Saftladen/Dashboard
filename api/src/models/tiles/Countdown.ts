import {GraphQLObjectType, GraphQLInt, GraphQLNonNull, GraphQLString} from "graphql";
import {GraphQLDateTime} from "graphql-iso-date";

export const Countdown = new GraphQLObjectType({
  name: "Countdown",
  sqlTable: "countdowns",
  uniqueKey: "id",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    label: {
      type: new GraphQLNonNull(GraphQLString),
    },
    endsAt: {
      sqlColumn: "ends_at",
      type: new GraphQLNonNull(GraphQLDateTime),
    },
  }),
});
