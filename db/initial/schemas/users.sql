create table users (
  id serial primary key,
  slack_user_id text not null,
  slack_data jsonb not null,

  created_at timestamp with time zone not null default now()
);

create unique index unq_users_slack_user_id on users(slack_user_id);
