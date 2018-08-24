import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLEnumType,
} from "graphql";
import Axios from "axios";
import * as getValue from "get-value";
import generateTileModel, {FieldsWithValues} from "./generator";
import {AnyType} from "../../graphql-helper";

const HttpMethod = new GraphQLEnumType({
  name: "HttpMethod",
  values: {
    GET: {value: "get"},
    POST: {value: "post"},
  },
});

const modifyData = async (fields: FieldsWithValues) => {
  const data = await extractData(fields);
  fields.data = data ? [data] : data;
  return fields;
};

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
const {Type: ShowNumber, mutations} = generateTileModel({
  name: "ShowNumber",
  tableName: "show_numbers",
  placementFk: "show_number_id",
  placementType: "show_number",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    label: {
      editable: true,
      type: new GraphQLNonNull(GraphQLString),
    },
    url: {
      editable: true,
      type: new GraphQLNonNull(GraphQLString),
    },
    method: {
      editable: true,
      type: new GraphQLNonNull(HttpMethod),
    },
    headers: {
      editable: true,
      type: new GraphQLNonNull(AnyType),
    },
    data: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLFloat)),
    },
    lastData: {
      type: GraphQLFloat,
      sqlExpr: (table, args) => `${table}.data[1]`,
    },
    body: {
      editable: true,
      type: GraphQLString,
    },
    valueExtractor: {
      editable: true,
      sqlColumn: "value_extractor",
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  modifiyInsert: modifyData,
  modifiyUpdate: modifyData,
});

export {ShowNumber, mutations};
