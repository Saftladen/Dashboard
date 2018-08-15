import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
  GraphQLFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLEnumType,
} from "graphql";
import {createMutation} from "../../graphql-helper";

const MediaType = new GraphQLEnumType({
  name: "MediaType",
  values: {
    IMAGE: {value: "image"},
    VIDEO: {value: "video"},
  },
});

export const Media = new GraphQLObjectType({
  name: "Media",
  sqlTable: "medias",
  uniqueKey: "id",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    label: {
      type: new GraphQLNonNull(GraphQLString),
    },
    type: {
      type: new GraphQLNonNull(MediaType),
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
});

export const mutations: GraphQLFieldConfigMap<any, any> = {
  addMedia: createMutation(
    Media,
    new GraphQLInputObjectType({
      name: "AddMediaInput",
      fields: {
        label: {type: new GraphQLNonNull(GraphQLString)},
        url: {type: new GraphQLNonNull(GraphQLString)},
        type: {type: new GraphQLNonNull(MediaType)},
        isPrivate: {type: new GraphQLNonNull(GraphQLBoolean)},
      },
    }),
    async (input, ctx) => {
      const {
        rows: [media],
      } = await ctx.db(
        "insert into medias (label, url, type, creator_id) VALUES ($1, $2, $3, $4) returning *",
        [input.label, input.url, input.type, ctx.currentUserId]
      );
      await ctx.db(
        "insert into placement_scores (score, decay_rate, constant_until, is_private, creator_id, media_id, type) VALUES ($1, $2, $3, $4, $5, $6, $7) returning id",
        [5, 0.02, new Date(), input.isPrivate, ctx.currentUserId, media.id, "media"]
      );
      return media;
    }
  ),
  updateMedia: createMutation(
    Media,
    new GraphQLInputObjectType({
      name: "UpdateMediaInput",
      fields: {
        id: {type: new GraphQLNonNull(GraphQLInt)},
        label: {type: new GraphQLNonNull(GraphQLString)},
        url: {type: new GraphQLNonNull(GraphQLString)},
        type: {type: new GraphQLNonNull(MediaType)},
      },
    }),
    async (input, ctx) => {
      const {
        rows: [media],
      } = await ctx.db("update medias set label=$2, url=$3, type=$4 where id=$1 returning *", [
        input.id,
        input.label,
        input.url,
        input.type,
      ]);
      await ctx.db("update placement_scores set constant_until=$2 where media_id=$1", [
        input.id,
        new Date(),
      ]);
      return media;
    }
  ),
  deleteMedia: createMutation(
    Media,
    new GraphQLInputObjectType({
      name: "DeleteMediaInput",
      fields: {
        id: {type: new GraphQLNonNull(GraphQLInt)},
      },
    }),
    async (input, ctx) => {
      await ctx.db("delete from placement_scores where media_id=$1", [input.id]);
      const {rows} = await ctx.db("delete from medias where id=$1 returning *", [input.id]);
      return rows[0];
    }
  ),
};
