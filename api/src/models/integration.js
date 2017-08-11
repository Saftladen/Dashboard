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

const getData = (db, type, userId) =>
  db
    .query("select data from integrations where type=$1 and user_id=$2", [type, userId])
    .then(res => (res.rows.length > 0 ? res.rows[0].data : null));

const getNoUserData = (db, type) =>
  db
    .query("select data from integrations where type=$1 and user_id is null", [type])
    .then(res => (res.rows.length > 0 ? res.rows[0].data : null));

export default {
  create,
  has,
  getData,
  getNoUserData,
  Type,
};
