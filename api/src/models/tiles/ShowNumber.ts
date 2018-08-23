import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
  GraphQLFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLList,
  GraphQLFloat,
  GraphQLEnumType,
} from "graphql";
import {createMutation, AnyType} from "../../graphql-helper";
import Axios from "axios";
import * as getValue from "get-value";

const HttpMethod = new GraphQLEnumType({
  name: "HttpMethod",
  values: {
    GET: {value: "get"},
    POST: {value: "post"},
  },
});

export const ShowNumber = new GraphQLObjectType({
  name: "ShowNumber",
  sqlTable: "show_numbers",
  uniqueKey: "id",
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLInt)},
    label: {type: new GraphQLNonNull(GraphQLString)},
    url: {type: new GraphQLNonNull(GraphQLString)},
    method: {type: new GraphQLNonNull(HttpMethod)},
    headers: {type: new GraphQLNonNull(AnyType)},
    data: {type: new GraphQLNonNull(new GraphQLList(GraphQLFloat))},
    lastData: {
      type: GraphQLFloat,
      sqlExpr: (table, args) => `${table}.data[1]`,
    },
    body: {type: GraphQLString},
    valueExtractor: {sqlColumn: "value_extractor", type: new GraphQLNonNull(GraphQLString)},
  }),
});

interface NumerDataArgs {
  url: string;
  method: "get" | "post";
  headers: {[key: string]: string};
  body: string | null;
}

export const getNumberData = async (row: NumerDataArgs) => {
  const {data, status} = await Axios({
    url: row.url,
    method: row.method,
    headers: {
      "User-Agent": "Saftboard",
      "Accept-Encoding": "gzip",
      ...row.headers,
    },
    data: row.body,
  });
  return {data, status};
};

export const extractData = async (row: any) => {
  const {data, status} = await getNumberData(row);
  if (status < 300 && data) {
    const val = getValue(data, row.value_extractor || row.valueExtractor);
    const number = parseFloat(val);
    if (!Number.isNaN(number)) {
      return number;
    }
  }
  return null;
};

export const mutations: GraphQLFieldConfigMap<any, any> = {
  addShowNumber: createMutation(
    ShowNumber,
    new GraphQLInputObjectType({
      name: "AddShowNumberInput",
      fields: {
        label: {type: new GraphQLNonNull(GraphQLString)},
        url: {type: new GraphQLNonNull(GraphQLString)},
        method: {type: new GraphQLNonNull(HttpMethod)},
        headers: {type: new GraphQLNonNull(AnyType)},
        body: {type: GraphQLString},
        valueExtractor: {type: new GraphQLNonNull(GraphQLString)},
        isPrivate: {type: new GraphQLNonNull(GraphQLBoolean)},
      },
    }),
    async (input, ctx) => {
      const data = await extractData(input);
      const {
        rows: [showNumber],
      } = await ctx.db(
        "insert into show_numbers (label, url, method, headers, body, value_extractor, data, creator_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning *",
        [
          input.label,
          input.url,
          input.method,
          input.headers,
          input.body,
          input.valueExtractor,
          data !== null ? [data] : [],
          ctx.currentUserId,
        ]
      );
      await ctx.db(
        "insert into placement_scores (score, decay_rate, constant_until, is_private, creator_id, show_number_id, type) VALUES ($1, $2, now(), $3, $4, $5, $6) returning id",
        [10, 0.05, input.isPrivate, ctx.currentUserId, showNumber.id, "show_number"]
      );
      return showNumber;
    }
  ),
  updateShowNumber: createMutation(
    ShowNumber,
    new GraphQLInputObjectType({
      name: "UpdateShowNumberInput",
      fields: {
        id: {type: new GraphQLNonNull(GraphQLInt)},
        label: {type: new GraphQLNonNull(GraphQLString)},
        url: {type: new GraphQLNonNull(GraphQLString)},
        method: {type: new GraphQLNonNull(HttpMethod)},
        headers: {type: new GraphQLNonNull(AnyType)},
        body: {type: GraphQLString},
        valueExtractor: {type: new GraphQLNonNull(GraphQLString)},
      },
    }),
    async (input, ctx) => {
      const data = await extractData(input);
      const {
        rows: [showNumber],
      } = await ctx.db(
        `update show_numbers set
          label=$2,
          url=$3,
          method=$4,
          headers=$5,
          body=$6,
          value_extractor=$7,
          data=$8
        where id=$1 returning *`,
        [
          input.id,
          input.label,
          input.url,
          input.method,
          input.headers,
          input.body,
          input.valueExtractor,
          data !== null ? [data] : [],
        ]
      );
      await ctx.db("update placement_scores set constant_until=now() where show_number_id=$1", [
        input.id,
      ]);
      return showNumber;
    }
  ),
  deleteShowNumber: createMutation(
    ShowNumber,
    new GraphQLInputObjectType({
      name: "DeleteShowNumberInput",
      fields: {
        id: {type: new GraphQLNonNull(GraphQLInt)},
      },
    }),
    async (input, ctx) => {
      await ctx.db("delete from placement_scores where show_number_id=$1", [input.id]);
      const {rows} = await ctx.db("delete from show_numbers where id=$1 returning *", [input.id]);
      return rows[0];
    }
  ),
};
