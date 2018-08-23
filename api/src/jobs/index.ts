require("dotenv").config();
import {format} from "date-fns";
import {scheduleJob} from "node-schedule";
import * as pg from "pg";
import {DbClient} from "types";
import chalk from "chalk";
import {jobError} from "../lib/reportError";
import {dbConfig} from "../lib/db-config";
import {getCachingClient} from "../lib/caching-db-client";
import updateTweetUsers from "./update-tweet-users";
import updateShowNumbers from "./update-show-numbers";

const dbPool = new pg.Pool(dbConfig);

interface Job {
  schedule: string;
  name: string;
  job: (db: DbClient) => Promise<any>;
}

const jobs: Job[] = [
  {
    name: "Refetch Data",
    schedule: "*/5 * * * *",
    job: async db => Promise.all([updateTweetUsers(db), updateShowNumbers(db)]),
  },
];

const log = (content: string) => {
  const now = format(new Date(), "YYYY-MM-DD HH:mm:ss");
  console.log(`${chalk.dim(`[${chalk.gray(now)}]`)} ${content}`);
};

jobs.forEach(({schedule, job, name}) => {
  scheduleJob(schedule, async () => {
    log(chalk.dim(`>>> start ${chalk.blue(name)}`));
    let withError = false;
    await getCachingClient(dbPool, db => job(db)).catch(err => {
      withError = true;
      jobError(err);
    });
    log(chalk.dim(`<<< finished ${chalk[withError ? "red" : "blue"](name)}`));
  });

  log(chalk.dim(`scheduled ${chalk.yellow(schedule)} ${chalk.blue(name)}`));
});
