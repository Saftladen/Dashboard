const Type = {
  SlackTeam: "slack_team",
  SlackUser: "slack_user",
};

const create = (db, type, userId, data) =>
  db.query("insert into integrations (type, user_id, data) VALUES ($1, $2, $3)", [
    type,
    userId,
    data,
  ]);

const has = (db, type) =>
  db
    .query("select id from integrations where type=$1 limit 1", [type])
    .then(res => res.rows.length > 0);

export default {
  create,
  has,
  Type,
};
