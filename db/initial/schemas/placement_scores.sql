create table placement_scores (
  id serial primary key,
  score float not null,
  decay_rate float not null,
  constant_until timestamp with time zone not null default now(),

  creator_id int not null references users(id),
  created_at timestamp with time zone not null default now()
);

