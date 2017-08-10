create type tokentype as enum ('auth_token');

create table tokens (
  id serial primary key,
  token_hash text not null UNIQUE,
  type tokentype not null,
  is_used boolean not null default false,
  data jsonb not null,
  created_at timestamp with time zone not null default now()
);
