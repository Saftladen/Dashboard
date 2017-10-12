const create = (db, score, decayRate, constantUntil, isPrivate, creatorId, {countdownId}) =>
  db
    .query(
      "insert into placement_scores (score, decay_rate, constant_until, is_private, creator_id, countdown_id) VALUES ($1, $2, $3, $4, $5, $6) returning id",
      [score, decayRate, constantUntil, isPrivate, creatorId, countdownId]
    )
    .then(result => result.rows[0].id);

const enrichWith = (db, rows, idField, query) => {
  const relevantRows = rows.filter(r => r[idField]);
  return relevantRows.length > 0
    ? db.query(query, [relevantRows.map(r => r[idField])]).then(innerRes => {
        const byId = innerRes.rows.reduce((m, r) => (m[r.id] = r) && m, {});
        console.log("byId", byId);
        relevantRows.forEach(r => (r[idField.slice(0, -3)] = byId[r[idField]]));
        console.log("relevantRows", relevantRows);
        return relevantRows;
      })
    : Promise.resolve([]);
};

const getTop = (db, count, isPublicOnly) =>
  db
    .query(
      `
    select current_score, creator_id, is_private, countdown_id
    from vw_top_placements
    ${isPublicOnly ? "where not is_private" : ""}
    limit $1
      `,
      [count]
    )
    .then(r =>
      Promise.all([
        enrichWith(
          db,
          r.rows,
          "countdown_id",
          "select id, label, ends_at, creator_id from countdowns where id = any($1::int[])"
        ),
        enrichWith(
          db,
          r.rows,
          "media_id",
          "select id, label, type, url, creator_id from medias where id = any($1::int[])"
        ),
      ]).then(list => list.reduce((m, results) => [...m, ...results]), [])
    );

export default {
  create,
  getTop,
};