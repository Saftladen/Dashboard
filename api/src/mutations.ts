import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInputObjectType,
} from "graphql";
import {Countdown} from "./models/tiles/Countdown";
import {GraphQLDateTime} from "graphql-iso-date";
import {Ctx} from "./controllers/graphql";

const Mutations = new GraphQLObjectType({
  name: "Mutations",
  fields: {
    addCountdown: {
      type: Countdown,
      args: {
        input: {
          type: new GraphQLInputObjectType({
            name: "AddCountdownInput",
            fields: {
              label: {type: new GraphQLNonNull(GraphQLString)},
              isPrivate: {type: new GraphQLNonNull(GraphQLBoolean)},
              endsAt: {type: new GraphQLNonNull(GraphQLDateTime)},
            },
          }),
        },
      },
      resolve: async (parent, {input}, ctx: Ctx) => {
        const {
          rows: [countdown],
        } = await ctx.db(
          "insert into countdowns (label, ends_at, creator_id) VALUES ($1, $2, $3) returning *",
          [input.label, input.endsAt, ctx.currentUserId]
        );
        await ctx.db(
          "insert into placement_scores (score, decay_rate, constant_until, is_private, creator_id, countdown_id) VALUES ($1, $2, $3, $4, $5, $6) returning id",
          [10, 10, input.endsAt, input.isPrivate, ctx.currentUserId, countdown.id]
        );
        return countdown;
      },
    },
  },
});

export default Mutations;
