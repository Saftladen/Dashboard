import {GraphQLObjectType, GraphQLInt, GraphQLNonNull, GraphQLString} from "graphql";
import {UserIntegration} from "./Integration";

export const User = new GraphQLObjectType({
  name: "User",
  sqlTable: "users",
  uniqueKey: "id",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    integrationData: {
      type: UserIntegration,
      sqlJoin(userTable, intTable) {
        return `${userTable}.id = ${intTable}.user_id`;
      },
    },
  }),
});
