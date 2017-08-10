create table users (
  id serial primary key,
  name text,

  created_at timestamp with time zone not null default now()
);
