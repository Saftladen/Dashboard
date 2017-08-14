create or replace view vw_top_placements as
  select *, score - greatest(0, extract(epoch from now() - constant_until) / 60) * decay_rate current_score
  from placement_scores;
