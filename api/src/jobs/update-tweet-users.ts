import {DbClient} from "types";
import {findLastTweet} from "../models/tiles/TwitterUser";

const tweetsDiffer = (t1: any | null, t2: any | null) => {
  if (!t1 && !t2) return false;
  if ((!t1 && t2) || (!t2 && t1)) return true;
  return t1.id_str !== t2.id_str;
};

export default async function updateTweetUsers(db: DbClient) {
  const {rows} = await db("select id, username, last_tweet_data from twitter_users");
  for (const row of rows) {
    const lastTweet = await findLastTweet(row.username);
    if (tweetsDiffer(lastTweet, row.last_tweet_data)) {
      await db("update twitter_users set last_tweet_data=$1 where id=$2", [lastTweet, row.id]);
      await db("update placement_scores set constant_until=now() where twitter_user_id=$1", [
        row.id,
      ]);
    }
  }
}
