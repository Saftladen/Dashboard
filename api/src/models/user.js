const create = (db, slackData) =>
  db
    .query("insert into users (name) VALUES ($1, $2) returning id", [slackData.user.name])
    .then(result => ({userId: result.rows[0].id}));
// TODO: safe data in integrations

const update = (db, userId, data) => {
  const keys = Object.keys(data);
  return db.query(
    `update users set ${keys.map((k, i) => `${k}=$${i + 1}`).join(", ")} where id=$${keys.length +
      1}`,
    [...keys.map(k => data[k]), userId]
  );
};

const login = (db, email, password) =>
  db
    .query("select id, password_hash, account_id from users where email=$1", [email])
    .then(
      ({rows}) =>
        rows.length === 0
          ? Promise.reject({error: "bad_email"})
          : comparePw(password, rows[0].password_hash).then(
              res =>
                res
                  ? Promise.resolve({userId: rows[0].id, accountId: rows[0].account_id})
                  : Promise.reject({error: "bad_pw"})
            )
    );

export default {
  create,
  login,
  update,
};