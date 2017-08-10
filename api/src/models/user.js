const create = (client, slackUserId, slackData) =>
  client
    .query("insert into users (slack_user_id, slack_data) VALUES ($1, $2) returning id", [
      slackUserId,
      slackData,
    ])
    .then(result => ({userId: result.rows[0].id}));

const update = (client, userId, data) => {
  const keys = Object.keys(data);
  return client.query(
    `update users set ${keys.map((k, i) => `${k}=$${i + 1}`).join(", ")} where id=$${keys.length +
      1}`,
    [...keys.map(k => data[k]), userId]
  );
};

const login = (client, email, password) =>
  client
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
