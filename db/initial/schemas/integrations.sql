create type integrationtype as enum ('slack_team', 'slack_user');

create table integrations (
  id serial primary key,
  type integrationtype not null,
  user_id int references users(id),
  data jsonb not null,

  created_at timestamp with time zone not null default now()
);

alter table integrations enable row level security;
grant select on integrations to member, guest;

create policy select_guest
  on integrations for select to guest, member using (type = 'slack_user');
