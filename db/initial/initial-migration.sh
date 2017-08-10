#!/bin/sh

set -e

psql saftboard -c 'drop schema public cascade; create schema public;'

psql saftboard <<EOF
  BEGIN;
  CREATE EXTENSION IF NOT EXISTS citext;

  $(< schemas/users.sql)
  $(< schemas/countdowns.sql)
  $(< schemas/medias.sql)
  $(< schemas/placement_scores.sql)

  END;
EOF
