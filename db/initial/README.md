# setup

- `echo "CREATE ROLE dbmaster superuser login;CREATE DATABASE saftboard OWNER=dbmaster;" | psql`
- run `./initial-migration.sh` from this folder
