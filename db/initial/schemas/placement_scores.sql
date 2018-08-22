create type placementtype as enum ('countdown', 'media', 'twitter_user');

create table placement_scores (
  id serial primary key,
  score float not null,
  decay_rate float not null,
  constant_until timestamp with time zone not null default now(),
  is_private boolean not null,
  type placementtype not null,
  countdown_id int references countdowns(id),
  media_id int references medias(id),
  twitter_user_id int references twitter_users(id),

  creator_id int not null references users(id),
  created_at timestamp with time zone not null default now()
);

create trigger change_placement_scores after insert or update or delete on placement_scores for each statement execute procedure f_notify();
