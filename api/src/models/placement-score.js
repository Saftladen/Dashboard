const create = (db, score, decayRate, constantUntil, isPrivate, creatorId, {countdownId}) =>
  db
    .query(
      "insert into placement_scores (score, decay_rate, constant_until, is_private, creator_id, countdown_id) VALUES ($1, $2, $3, $4, $5, $6) returning id",
      [score, decayRate, constantUntil, isPrivate, creatorId, countdownId]
    )
    .then(result => result.rows[0].id);

export default {
  create,
};
