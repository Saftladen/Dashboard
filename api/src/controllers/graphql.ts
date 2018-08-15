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
} from "graphql";
import connectPg from "../middlewares/pg";
import * as LRU from "lru-cache";
import {createHash} from "crypto";
import {resolveGraphiQLString} from "apollo-server-module-graphiql";
import schema from "../schema";

const hashQuery = (query: string) =>
  createHash("sha1")
    .update(query)
    .digest("base64");

const graphqlController: fastify.Plugin<Server, IncomingMessage, ServerResponse, {}> = async (
  instance,
  options,
  next
) => {
  const schemaValidationErrors = validateSchema(schema);
  if (schemaValidationErrors.length > 0) {
    throw new Error(schemaValidationErrors.map(e => e.message).join(".\n"));
  }

  connectPg(instance);
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
      return execute(
        schema,
        documentAST,
        undefined, // rootValue
        context,
        variables,
        operationName
      );
    } catch (contextError) {
      return Promise.reject({status: 400, error: contextError});
    }
  });

  instance.get("/graphiql", async (req, res) => {
    try {
      const {query} = req.params;
      const graphiqlString = await resolveGraphiQLString(query, {
        endpointURL: "/graphql",
      });
      res.type("text/html").send(graphiqlString);
    } catch (error) {
      return Promise.reject({status: 500, error});
    }
  });

  if (next) next();
};

export default graphqlController;
