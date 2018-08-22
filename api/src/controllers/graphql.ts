import * as fastify from "fastify";
import {Server, IncomingMessage, ServerResponse} from "http";
import {getUserIdFromToken} from "../lib/token";
import {
  Source,
  validateSchema,
  parse,
  DocumentNode,
  validate,
  specifiedRules,
  execute,
  subscribe,
} from "graphql";
import connectPg from "../middlewares/pg";
import * as LRU from "lru-cache";
import {createHash} from "crypto";
import {resolveGraphiQLString} from "apollo-server-module-graphiql";
import {SubscriptionServer} from "subscriptions-transport-ws";
import getSchema from "../schema";
import enhanceClient from "../lib/query-logger";

const hashQuery = (query: string) =>
  createHash("sha1")
    .update(query)
    .digest("base64");

const graphqlController: fastify.Plugin<Server, IncomingMessage, ServerResponse, {}> = async (
  instance,
  options,
  next
) => {
  connectPg(instance);

  const client = enhanceClient(
    instance.log.info.bind(instance.log),
    await instance.pg.pool.connect()
  );

  const schema = await getSchema(client);
  const schemaValidationErrors = validateSchema(schema);
  if (schemaValidationErrors.length > 0) {
    throw new Error(schemaValidationErrors.map(e => e.message).join(".\n"));
  }

  instance.register(require("fastify-cookie"));

  type CacheVal = {size: number; node: DocumentNode};
  const cache = LRU<string, CacheVal>({max: 500 * 1024, length: e => e.size});

  instance.post("/graphql", async req => {
    const auth = await getUserIdFromToken(instance.pg.query, req.headers["x-auth-token"]);
    const context = {
      currentUserId: auth.ok ? auth.data.userId : null,
      db: req.db,
    };
    const {query, variables, operationName} = req.body;
    if (!query) return Promise.reject({status: 400, error: "Need 'query' parameter"});
    const source = new Source(query, "GraphQL request");
    const queryHash = hashQuery(query);
    const cacheVal = cache.get(queryHash);
    let documentAST: DocumentNode;
    if (!cacheVal) {
      try {
        documentAST = parse(source);
      } catch (syntaxError) {
        return Promise.reject({status: 400, error: syntaxError});
      }
      const validationErrors = validate(schema, documentAST, specifiedRules);
      if (validationErrors.length > 0) {
        return Promise.reject({status: 400, error: validationErrors});
      }
      cache.set(queryHash, {size: query.length, node: documentAST});
    } else {
      documentAST = cacheVal.node;
    }
    try {
      const result = await execute(
        schema,
        documentAST,
        undefined, // rootValue
        context,
        variables,
        operationName
      );
      if (result.errors) {
        return Promise.reject({...result, status: 400});
      } else {
        return result;
      }
    } catch (contextError) {
      return Promise.reject({status: 400, error: contextError});
    }
  });

  new SubscriptionServer(
    {execute, subscribe, schema},
    {server: instance.server, path: "/subscriptions"}
  );

  instance.get("/graphiql", async (req, res) => {
    try {
      const {query} = req.params;
      const graphiqlString = await resolveGraphiQLString(query, {
        endpointURL: "/graphql",
        subscriptionsEndpoint: `${process.env.SUBSCRIPTIONS_HOST}/subscriptions`,
        passHeader: `'x-auth-token': '${req.cookies["auth-token"]}'`,
      });
      res.type("text/html").send(graphiqlString);
    } catch (error) {
      return Promise.reject({status: 500, error});
    }
  });

  if (next) next();
};

export default graphqlController;
