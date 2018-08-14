import {GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLNonNull} from "graphql";

export const TeamIntegration = new GraphQLObjectType({
  name: "TeamIntegration",
  sqlTable: "integrations",
  uniqueKey: "id",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      sqlExpr: (table, args) => `(${table}.public_data->>'teamName')`,
    },
  }),
});

export const UserIntegration = new GraphQLObjectType({
  name: "UserIntegration",
  sqlTable: "integrations",
  uniqueKey: "id",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    avatarUrl: {
      type: new GraphQLNonNull(GraphQLString),
      sqlExpr: (table, args) => `(${table}.public_data->>'avatarUrl')`,
    },
  }),
});
