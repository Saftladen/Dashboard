const create = (db, label, endsAt, creatorId) =>
  db
    .query("insert into countdowns (label, ends_at, creator_id) VALUES ($1, $2, $3) returning id", [
      label,
      endsAt,
      creatorId,
    ])
    .then(result => result.rows[0].id);

const getByIds = (db, ids) =>
  db.query("select id, label, ends_at, creator_id from countdowns where id in ($1)", [ids]);

const remove = (db, id) => db.query("delete from countdowns where id=$1", [id]);

export default {
  create,
  getByIds,
  remove,
};
