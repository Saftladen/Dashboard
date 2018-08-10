import {Client, PoolClient, QueryResult} from "pg";
import chalk from "chalk";
import isObject = require("lodash/isObject");
import {DbClient} from "types";

export default function enhanceClient(log: (arg: any) => void, client: Client | PoolClient) {
  if ((client.query as any)._enhanced) return client;
  (client.query as any) = enhancedQuery(log, client.query.bind(client));
  (client.query as any)._enhanced = true;
  return client;
}

type RetVal = (queryText: string, values?: any[]) => Promise<QueryResult>;

const printArg = (o: any) => (isObject(o) ? JSON.stringify(o) : o);

export function enhancedQuery(log: (arg: any, arg2?: any) => void, client: DbClient): RetVal {
  return (queryText, rawValues) => {
    const values = rawValues || [];
    const sql = queryText.replace(/\$(\d+)\b/g, (m, numStr) => {
      const num = parseInt(numStr, 10);
      if (num > 0 && num <= values.length) {
        return chalk.cyan(printArg(values[num - 1]));
      } else {
        return m;
      }
    });
    const start = process.hrtime();
    const getDiff = (): string => {
      const diff = process.hrtime(start);
      const totalMs = Math.round(diff[0] * 1000 + diff[1] / 1e6);
      const col =
        totalMs < 20 ? chalk.white : totalMs < 100 ? chalk.yellow : chalk.bgRed.white.bold;
      return `${totalMs < 10 ? " " : ""}${col(totalMs.toString())}${chalk.dim("ms")}`;
    };
    return client(queryText, values).then(
      (r: QueryResult) => {
        const parts = [
          getDiff(),
          ...((r as any)._isCached ? [chalk.gray("[CACHED]")] : []),
          chalk.blue(sql),
          chalk.dim("->"),
          chalk.white(`${r.rowCount} row${r.rowCount === 1 ? "" : "s"}`),
        ];
        log(parts.join(" "));
        return r;
      },
      (e: any) => {
        log(`${getDiff()} ${chalk.red(sql)}`);
        log("raw arguments: ", ...values);
        e.message = `${e.message}\n\n${sql}`;
        return Promise.reject(e);
      }
    );
  };
}
