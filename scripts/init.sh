#!/bin/bash
set +e

set -e

PG_PORT=5432
DB_NAME=bsadb
DB_PASSWORD=bsa
DB_USER=bsa
POSTGRES_USER=postgres
POSTGRES_DB=postgres
POSTGRES_PASSWORD=$3

# Wait for PostgreSQL to be ready
until psql -U "bsa" -d bsadb -c '\q'; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "PostgreSQL is up - executing command"

psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -p "$PG_PORT" <<-EOSQL
  drop database if exists ${DB_NAME};
  do
  \$body\$
  declare
    num_users integer;
  begin
    SELECT count(*)
      into num_users
    FROM pg_user
    WHERE usename = '${DB_USER}';

    IF num_users = 0 THEN
        CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
    END IF;
  end
  \$body\$
  ;
  ALTER ROLE ${DB_USER} CREATEDB;
  CREATE DATABASE ${DB_NAME} WITH OWNER=${DB_USER};
  GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOSQL

psql --username "$DB_USER" --dbname "$DB_NAME" -p "$PG_PORT" <<-EOSQL
  CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
  create extension ltree;
EOSQL
