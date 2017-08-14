#!/bin/bash

set -e

psql -h 127.0.0.1 saftboard -U saftboard -c 'drop schema public cascade; create schema public;'

psql -h 127.0.0.1 saftboard -U saftboard <<EOF
  BEGIN;
  CREATE EXTENSION IF NOT EXISTS citext;

  $(< schemas/users.sql)
  $(< schemas/countdowns.sql)
  $(< schemas/medias.sql)
  $(< schemas/placement_scores.sql)
  $(< schemas/tokens.sql)
  $(< schemas/integrations.sql)

  $(< ../views-and-functions/vw_top_placements.sql)
  END;
EOF
