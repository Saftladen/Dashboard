require("source-map-support").install();
require("dotenv").config();
import * as pg from "pg";
import {jobError} from "../lib/reportError";
import {getCachingClient} from "../lib/caching-db-client";
import {dbConfig} from "../lib/db-config";
import updateShowNumbers from "./update-show-numbers";

const run = async () => {
  const dbPool = new pg.Pool(dbConfig);
  await getCachingClient(dbPool, updateShowNumbers).catch(err => jobError(err));
  await dbPool.end();
};

run().catch(err => jobError(err));
