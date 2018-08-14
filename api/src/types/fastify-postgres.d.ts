import {FastifyRequest, FastifyInstance, Plugin} from "fastify";
import {QueryConfig, QueryResult, Query, Pool, Client, ConnectionConfig} from "pg";
import {Readable} from "stream";
import {Server, IncomingMessage, ServerResponse} from "http";

declare module "fastify" {
  interface FastifyRequest<HttpRequest = IncomingMessage> {}

  interface FastifyInstance {
    pg: {
      connect(): Promise<void>;
      connect(callback: (err: Error) => void): void;
      query(queryStream: QueryConfig & Readable): Readable;
      query(queryConfig: QueryConfig): Promise<QueryResult>;
      query(queryText: string, values?: any[]): Promise<QueryResult>;
      query(
        queryTextOrConfig: string | QueryConfig,
        callback: (err: Error, result: QueryResult) => void
      ): Query;
      query(
        queryText: string,
        values: any[],
        callback: (err: Error, result: QueryResult) => void
      ): Query;
      pool: Pool;
      Client: Client;
    };
  }
}

type Options = ConnectionConfig & {
  name?: string;
  native?: boolean;
};
declare const FastifyPostgres: Plugin<Server, IncomingMessage, ServerResponse, Options>;
export = FastifyPostgres;
