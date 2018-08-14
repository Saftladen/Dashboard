import * as crypto from "crypto";
import * as randomstring from "randomstring";
import {DbClient} from "types";

const MAX_AGE = 24 * 365 * 2 * 3600;

export const sha = (secret: string) =>
  crypto
    .createHash("sha256")
    .update(secret, "utf8")
    .digest()
    .toString("hex");

const getVerifiedData = async (db: DbClient, type: string, tokenStr: string) => {
  if (!tokenStr) return {ok: false, error: "no token"};
  const result = await db(
    "select data, created_at from tokens where type=$1 and token_hash=$2 and not is_used",
    [type, sha(tokenStr)]
  );
  if (!result.rows.length) return {ok: false, error: "bad token"};
  const token = result.rows[0];
  if (token.is_used) return {ok: false, error: "already used"};
  const ageInMs = new Date().getTime() - token.created_at.getTime();
  if (ageInMs / (1000 * 3600) > MAX_AGE) return {ok: false, error: "token too old"};
  return {ok: true, data: token.data};
};

export const createAuthToken = (db: DbClient, userId: number) => {
  const token = randomstring.generate(24);
  return db(`insert into tokens (token_hash, type, data) values ($1, $2, $3)`, [
    sha(token),
    "auth_token",
    {userId},
  ]).then(() => token);
};

export const getUserIdFromToken = async (db: DbClient, token: string) =>
  getVerifiedData(db, "auth_token", token);
