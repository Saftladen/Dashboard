import {FastifyInstance} from "fastify";
import {QueryResult} from "pg";
import enhanceClient from "../lib/query-logger";

declare module "fastify" {
  interface FastifyRequest {
    db(queryText: string, values?: any[]): Promise<QueryResult>;
    _dbTimeoutId: NodeJS.Timer;
    _releaseClient: (rollback: boolean) => void;
  }
}

function connectPg(fastify: FastifyInstance, timeoutMs: number = 10000) {
  fastify.addHook("preHandler", async function(req, reply) {
    let isClosed = false;
    const rawClient = await this.pg.pool.connect();
    const client = enhanceClient(fastify.log.info.bind(fastify.log), rawClient);
    req.db = (q: string, args?: any[]) => {
      if (isClosed) throw new Error("transaction already closed!");
      return client.query(q, args);
    };
    req._releaseClient = async (rollback: boolean) => {
      if (isClosed) return;
      isClosed = true;
      if (rollback) {
        await client.query("ROLLBACK;");
      } else {
        await client.query("COMMIT;");
      }
      if ("release" in client) {
        client.release();
      } else {
        await client.end();
      }
    };
    await req.db("BEGIN;");

    req._dbTimeoutId = setTimeout(async () => {
      await req._releaseClient(true);
      const msg = `needed to kill transaction in _${req.req.url}_ after ${timeoutMs}ms`;
      fastify.log.error(msg);
    }, timeoutMs);
    return;
  });

  fastify.addHook("onSend", async (req, res) => {
    clearTimeout(req._dbTimeoutId);
    await req._releaseClient(res.res.statusCode >= 400);
    return;
  });
}

export default connectPg;
