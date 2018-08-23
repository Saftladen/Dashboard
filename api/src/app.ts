import * as fastify from "fastify";
import devLog from "./lib/dev-log";
import prodLog from "./lib/prod-log";
import * as cors from "cors";
import {dbConfig} from "./lib/db-config";
import * as fastifyPostgres from "fastify-postgres";
import authController from "./controllers/auth";
import graphqlController from "./controllers/graphql";
import testNumberController from "./controllers/test-number";

const opts: fastify.ServerOptions = {
  logger: {
    stream: process.env.NODE_ENV !== "development" ? prodLog : devLog,
  } as any,
};
const app: fastify.FastifyInstance = fastify(opts);

app.setErrorHandler((error: null | Error | {retval: any}, request, reply) => {
  if (reply.res.statusCode < 500) {
    let message;
    if (error && "retval" in error) {
      message = error.retval.error || error.retval;
    } else {
      message = (error && error.message) || error || "unknown";
    }
    reply.send({
      error: reply.res.statusMessage,
      message: message,
      statusCode: reply.res.statusCode,
    });
  } else if (process.env.NODE_ENV === "development" && error instanceof Error) {
    reply.send({
      error: error.name,
      message: error.message,
      statusCode: reply.res.statusCode,
    });
  } else {
    reply.send({
      error: "internal server error",
      message: "we'll track it down!",
      statusCode: reply.res.statusCode,
    });
  }
});

app.use(cors({maxAge: 365 * 24 * 3600}));
app.register(fastifyPostgres, dbConfig);

app.register(authController);
app.register(graphqlController);
app.register(testNumberController);

export default app;
