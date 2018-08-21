create table twitter_users (
  id serial primary key,
  username text not null,
  last_tweet_data jsonb,
  creator_id int not null references users(id),
  created_at timestamp with time zone not null default now()
);
