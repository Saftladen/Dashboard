drop schema if exists private_schema cascade;
create schema private_schema;

create type private_schema.tokentype as enum ('auth_token');

create table private_schema.tokens (
  id serial primary key,
  token_hash text not null UNIQUE,
  type private_schema.tokentype not null,
  is_used boolean not null default false,
  data jsonb not null,
  created_at timestamp with time zone not null default now()
);
