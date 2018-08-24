import {
  GraphQLFieldConfig,
  GraphQLObjectType,
  GraphQLFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInputFieldConfigMap,
  GraphQLInputType,
  GraphQLInt,
} from "graphql";
import {Ctx} from "../../graphql-helper";

interface GeneratorField extends GraphQLFieldConfig<any, any> {
  editable?: boolean;
}

export type FieldsWithValues = {[name: string]: any};

interface GeneratorInput {
  name: string;
  tableName: string;
  placementFk: string;
  placementType: string;
  fields: {[key: string]: GeneratorField};
  modifiyInsert?: (fields: FieldsWithValues) => Promise<FieldsWithValues>;
  modifiyUpdate?: (fields: FieldsWithValues) => Promise<FieldsWithValues>;
}

export default function generateTileModel(opts: GeneratorInput) {
  const Type = new GraphQLObjectType({
    name: opts.name,
    sqlTable: opts.tableName,
    uniqueKey: "id",
    fields: Object.entries(opts.fields).reduce(
      (m, [k, val]) => {
        const {editable, ...rest} = val;
        m[k] = rest;
        return m;
      },
      {} as GraphQLFieldConfigMap<any, any>
    ),
  });

  const editableFieldNames = Object.keys(opts.fields).filter(k => opts.fields[k].editable);
  const inputFields = editableFieldNames.reduce(
    (m, k) => {
      m[k] = {type: opts.fields[k].type as GraphQLInputType};
      return m;
    },
    {} as GraphQLInputFieldConfigMap
  );

  const AddMutation: GraphQLFieldConfig<any, any> = {
    type: Type,
    args: {
      input: {
        type: new GraphQLInputObjectType({
          name: `Add${opts.name}Input`,
          fields: {...inputFields, isPrivate: {type: new GraphQLNonNull(GraphQLBoolean)}},
        }),
      },
    },
    resolve: async (parent, {input}, ctx: Ctx) => {
      if (!ctx.currentUserId) return null;
      let fieldsWithData = editableFieldNames.reduce(
        (m, k) => {
          m[k] = input[k];
          return m;
        },
        {} as FieldsWithValues
      );
      fieldsWithData.creator_id = ctx.currentUserId;
      if (opts.modifiyInsert) fieldsWithData = await opts.modifiyInsert(fieldsWithData);
      const sqlFields = Object.keys(fieldsWithData).map(
        k => (opts.fields[k] && opts.fields[k].sqlColumn) || k
      );
      const sqlVals = Object.values(fieldsWithData);
      const idxs = sqlVals.map((_, i) => `$${i + 1}`);
      const sql1 = `insert into ${opts.tableName} (${sqlFields.join(", ")}) values (${idxs.join(
        ", "
      )}) returning *`;
      const {
        rows: [data],
      } = await ctx.db(sql1, sqlVals);
      const sql2 = `insert into placement_scores (score, decay_rate, constant_until, is_private, creator_id, ${
        opts.placementFk
      }, type) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
      await ctx.db(sql2, [
        10,
        0.05,
        new Date(),
        input.isPrivate,
        ctx.currentUserId,
        data.id,
        opts.placementType,
      ]);
      return data;
    },
  };

  const UpdateMutation: GraphQLFieldConfig<any, any> = {
    type: Type,
    args: {
      input: {
        type: new GraphQLInputObjectType({
          name: `Update${opts.name}Input`,
          fields: {id: {type: new GraphQLNonNull(GraphQLInt)}, ...inputFields},
        }),
      },
    },
    resolve: async (parent, {input}, ctx: Ctx) => {
      if (!ctx.currentUserId) return null;
      let fieldsWithData = editableFieldNames.reduce(
        (m, k) => {
          m[k] = input[k];
          return m;
        },
        {} as FieldsWithValues
      );
      if (opts.modifiyUpdate) fieldsWithData = await opts.modifiyUpdate(fieldsWithData);
      const sqlFields = Object.keys(fieldsWithData).map(k => opts.fields[k].sqlColumn || k);
      const sets = sqlFields.map((f, i) => `  ${f}=$${i + 2}`);
      const sqlVals = Object.values(fieldsWithData);
      const sql1 = `update ${opts.tableName} set\n${sets.join(",\n")} where id=$1 returning *`;
      const {
        rows: [data],
      } = await ctx.db(sql1, [input.id, ...sqlVals]);
      const sql2 = `update placement_scores set constant_until=$1 where ${opts.placementFk}=$2`;
      await ctx.db(sql2, [new Date(), data.id]);
      return data;
    },
  };

  const DeleteMutation: GraphQLFieldConfig<any, any> = {
    type: Type,
    args: {
      input: {
        type: new GraphQLInputObjectType({
          name: `Delete${opts.name}Input`,
          fields: {id: {type: new GraphQLNonNull(GraphQLInt)}},
        }),
      },
    },
    resolve: async (parent, {input}, ctx: Ctx) => {
      if (!ctx.currentUserId) return null;
      await ctx.db(`delete from placement_scores where ${opts.placementFk}=$1`, [input.id]);
      const {rows} = await ctx.db(`delete from ${opts.tableName} where id=$1 returning *`, [
        input.id,
      ]);
      return rows[0];
    },
  };

  const mutations: GraphQLFieldConfigMap<any, any> = {
    [`add${opts.name}`]: AddMutation,
    [`update${opts.name}`]: UpdateMutation,
    [`delete${opts.name}`]: DeleteMutation,
  };

  return {Type, mutations};
}
