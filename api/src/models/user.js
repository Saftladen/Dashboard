const createOrUpdate = (db, slackData) =>
  db
    .query(
      "insert into users (name, slack_id) VALUES ($1, $2) on conflict(slack_id) do update set name=excluded.name returning id",
      [slackData.user.name, slackData.user.id]
    )
    .then(result => result.rows[0].id);
// TODO: safe data in integrations

const update = (db, userId, data) => {
  const keys = Object.keys(data);
  return db.query(
    `update users set ${keys.map((k, i) => `${k}=$${i + 1}`).join(", ")} where id=$${keys.length +
      1}`,
    [...keys.map(k => data[k]), userId]
  );
};

export default {
  createOrUpdate,
  update,
};
