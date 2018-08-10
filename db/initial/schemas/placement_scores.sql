create table placement_scores (
  id serial primary key,
  score float not null,
  decay_rate float not null,
  constant_until timestamp with time zone not null default now(),
  is_private boolean not null,
  countdown_id int references countdowns(id),
  media_id int references medias(id),

  creator_id int not null references users(id),
  created_at timestamp with time zone not null default now()
);

grant select on placement_scores to member, guest;

create policy select_guest on countdowns for select to guest using (
  (select exists (select 1 from placement_scores ps where ps.countdown_id=countdowns.id and not is_private))
);


