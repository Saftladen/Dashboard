import {GraphQLInt, GraphQLNonNull, GraphQLString} from "graphql";
import {GraphQLDateTime} from "graphql-iso-date";
import generateTileModel from "./generator";

const {Type: Countdown, mutations} = generateTileModel({
  name: "Countdown",
  tableName: "countdowns",
  placementFk: "countdown_id",
  placementType: "countdown",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    label: {
      editable: true,
      type: new GraphQLNonNull(GraphQLString),
    },
    endsAt: {
      editable: true,
      sqlColumn: "ends_at",
      type: new GraphQLNonNull(GraphQLDateTime),
    },
  },
});

export {Countdown, mutations};
