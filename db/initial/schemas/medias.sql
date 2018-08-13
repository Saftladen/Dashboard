create type mediatype as enum ('image', 'video');

create table medias (
  id serial primary key,
  label text,
  type mediatype not null,
  url text not null,
  creator_id int not null references users(id),
  created_at timestamp with time zone not null default now()
);
