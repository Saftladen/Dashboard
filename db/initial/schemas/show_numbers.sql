create type httpmethod as enum ('get', 'post');

create table show_numbers (
  id serial primary key,
  label text not null,
  url text not null,
  method httpmethod not null,
  headers jsonb not null default '{}'::jsonb,
  body text,
  value_extractor text not null,
  data float[] not null default '{}',
  creator_id int not null references users(id),
  created_at timestamp with time zone not null default now()
);
