import {DbClient} from "types";
import {extractData} from "../models/tiles/ShowNumber";

export default async function updateShowNumbers(db: DbClient) {
  const {rows} = await db(
    "select id, url, method, headers, body, value_extractor, data[1] as last_data from show_numbers"
  );
  for (const row of rows) {
    const num = await extractData(row);
    if (num !== null) {
      await db("update show_numbers set data=($1 || data)[:1440] where id=$2", [[num], row.id]);
      if (num !== row.last_data) {
        await db("update placement_scores set constant_until=now() where show_number_id=$1", [
          row.id,
        ]);
      }
    }
  }
}
