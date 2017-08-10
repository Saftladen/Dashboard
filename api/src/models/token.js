import crypto from "crypto";
import randomstring from "randomstring";

export const sha = secret =>
  crypto.createHash("sha256").update(secret, "utf8").digest().toString("hex");

const createTokenString = () => randomstring.generate(24);

const create = (db, type, data) => {
  const token = createTokenString();
  return db
    .query(`insert into tokens (token_hash, type, data) values ($1, $2, $3)`, [
      sha(token),
      type,
      data,
    ])
    .then(() => token);
};

const getVerifiedData = (db, type, token) =>
  db
    .query("select data from tokens where type=$1 and token_hash=$2 and not is_used", [
      type,
      sha(token),
    ])
    .then(
      result =>
        result.rows.length > 0
          ? Promise.resolve(result.rows[0].data)
          : Promise.reject({error: "no_token"})
    );

const useUp = (db, type, token) =>
  db.query("update tokens set is_used=true where type=$1 and token_hash=$2", [type, sha(token)]);

const Type = {
  AuthToken: "auth_token",
};

export default {
  getVerifiedData,
  create,
  useUp,
  Type,
};
