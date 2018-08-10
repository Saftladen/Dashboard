drop role if exists member, guest;

create role member;
create role guest;

grant usage on schema public to member, guest;
alter default privileges in schema public grant usage, select on sequences to member;

create function current_user_id() returns int as $$
  select nullif(current_setting('request.user_id', true), '')::int;
$$ language sql stable set search_path from current;

create table users (
  id serial primary key,
  name text not null,
  slack_id text not null unique,

  created_at timestamp with time zone not null default now()
);

grant select on users to member, guest;

create function "current_user"() returns users
  language sql stable
  set search_path from current
  as $$
    select * from users where id = current_user_id();
  $$;
