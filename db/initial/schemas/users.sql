create table users (
  id serial primary key,
  name text not null,
  slack_id text not null unique,

  created_at timestamp with time zone not null default now()
);
