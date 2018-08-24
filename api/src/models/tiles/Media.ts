import {GraphQLInt, GraphQLNonNull, GraphQLString, GraphQLEnumType} from "graphql";
import generateTileModel from "./generator";

const MediaType = new GraphQLEnumType({
  name: "MediaType",
  values: {
    IMAGE: {value: "image"},
    VIDEO: {value: "video"},
  },
});

const {Type: Media, mutations} = generateTileModel({
  name: "Media",
  tableName: "medias",
  placementFk: "media_id",
  placementType: "media",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    label: {
      editable: true,
      type: new GraphQLNonNull(GraphQLString),
    },
    type: {
      editable: true,
      type: new GraphQLNonNull(MediaType),
    },
    url: {
      editable: true,
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});

export {Media, mutations};
