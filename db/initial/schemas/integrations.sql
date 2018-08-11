create type integrationtype as enum ('slack_team', 'slack_user');

create table integrations (
  id serial primary key,
  type integrationtype not null,
  user_id int references users(id),
  data jsonb not null,
  public_data jsonb not null,

  created_at timestamp with time zone not null default now()
);

grant select (id, type, user_id, public_data) on integrations to member, guest;
