import {
  GraphQLInputObjectType,
  GraphQLOutputType,
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLScalarType,
  Kind,
} from "graphql";
import {DbClient} from "types";
import joinMonster from "join-monster";

export type ResolveFn = (input: any, ctx: Ctx) => Promise<any> | null;
export type Ctx = {db: DbClient; currentUserId: number | null};

export const createMutation = (
  returnType: GraphQLOutputType,
  inputType: GraphQLInputObjectType,
  resolve: ResolveFn
): GraphQLFieldConfig<any, any> => ({
  type: returnType,
  args: {
    input: {
      type: inputType,
    },
  },
  resolve: async (parent, {input}, ctx: Ctx) => {
    if (!ctx.currentUserId) return null;
    return resolve(input, ctx);
  },
});

export const defaultQueryDbFn = (context: Ctx) => async (sql: string) =>
  (await context.db(sql)).rows;

export const monsterResolver: (
  fn?: (c: Ctx) => (sql: string) => Promise<any>
) => GraphQLFieldResolver<any, Ctx> = (queryDbFn = defaultQueryDbFn) => (
  parent,
  args,
  context,
  resolveInfo
) => {
  return joinMonster(resolveInfo, {currentUserId: context.currentUserId}, queryDbFn(context), {
    dialect: "pg",
  });
};

export const AnyType = new GraphQLScalarType({
  name: "Object",
  description: "Arbitrary object",
  parseValue: (value: any) => {
    return typeof value === "object" ? value : typeof value === "string" ? JSON.parse(value) : null;
  },
  serialize: (value: any) => {
    return typeof value === "object" ? value : typeof value === "string" ? JSON.parse(value) : null;
  },
  parseLiteral: (ast: any) => {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        throw new Error(`Not sure what to do with OBJECT for ObjectScalarType`);
      default:
        return null;
    }
  },
});
