import {enhancedQuery} from "./query-logger";
import {DbClient} from "types";
import * as pg from "pg";
import MiniEvent from "./mini-event";

const cachingQuery = (q: DbClient): DbClient => {
  let cache: {[key: string]: pg.QueryResult} = {};
  const waiting: {[key: string]: boolean | MiniEvent<{}>} = {};
  return async (sql: string, args?: any[]) => {
    const key = `${sql}_${(args || []).map(a => `${a}`).join("*")}`;
    if (waiting[key]) {
      if (waiting[key] === true) waiting[key] = new MiniEvent<{}>();
      await new Promise(res => (waiting[key] as MiniEvent<{}>).addListener(res));
    }
    const cachedRes = cache[key];
    if (cachedRes) {
      (cachedRes as any)._isCached = true;
      return Promise.resolve(cachedRes);
    } else {
      waiting[key] = true;
      const res = await q(sql, args);
      if (res.command === "SELECT") {
        cache[key] = res;
      } else {
        cache = {};
      }
      if (waiting[key] instanceof MiniEvent) (waiting[key] as MiniEvent<{}>).emit({});
      waiting[key] = false;
      return res;
    }
  };
};

export async function getCachingClient<T>(pool: pg.Pool, fn: (q: DbClient) => Promise<T>) {
  const client = await pool.connect();
  const query = enhancedQuery(console.log, cachingQuery(client.query.bind(client)));
  await query("BEGIN;");
  let error: Error | null = null;
  let result: T | null = null;
  try {
    result = await fn(query);
    await query("COMMIT;");
  } catch (e) {
    await query("ROLLBACK;");
    error = e;
  }
  client.release();
  if (error) throw error;
  return result as T;
}
