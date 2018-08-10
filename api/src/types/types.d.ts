import {QueryResult} from "pg";
import {Server, IncomingMessage, ServerResponse} from "http";

export interface DbClient {
  (queryText: string, values?: any[]): Promise<QueryResult>;
}

declare module "fastify" {
  interface FastifyInstance<
    HttpServer = Server,
    HttpRequest = IncomingMessage,
    HttpResponse = ServerResponse
  > {}

  interface FastifyRequest<HttpRequest = IncomingMessage> {}
}
