import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
  GraphQLFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLBoolean,
} from "graphql";
import {GraphQLDateTime} from "graphql-iso-date";
import {createMutation} from "../../graphql-helper";

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

export const mutations: GraphQLFieldConfigMap<any, any> = {
  addCountdown: createMutation(
    Countdown,
    new GraphQLInputObjectType({
      name: "AddCountdownInput",
      fields: {
        label: {type: new GraphQLNonNull(GraphQLString)},
        isPrivate: {type: new GraphQLNonNull(GraphQLBoolean)},
        endsAt: {type: new GraphQLNonNull(GraphQLDateTime)},
      },
    }),
    async (input, ctx) => {
      const {
        rows: [countdown],
      } = await ctx.db(
        "insert into countdowns (label, ends_at, creator_id) VALUES ($1, $2, $3) returning *",
        [input.label, input.endsAt, ctx.currentUserId]
      );
      await ctx.db(
        "insert into placement_scores (score, decay_rate, constant_until, is_private, creator_id, countdown_id, type) VALUES ($1, $2, $3, $4, $5, $6, $7) returning id",
        [10, 10, input.endsAt, input.isPrivate, ctx.currentUserId, countdown.id, "countdown"]
      );
      return countdown;
    }
  ),
};
