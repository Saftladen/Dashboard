create table countdowns (
  id serial primary key,
  label text not null,
  ends_at timestamp with time zone not null,
  creator_id int not null references users(id),
  created_at timestamp with time zone not null default now()
);

alter table countdowns enable row level security;
grant select on countdowns to member, guest;

