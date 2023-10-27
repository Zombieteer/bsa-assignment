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

psql --username "$DB_USER" --dbname "$DB_NAME" -p "$PG_PORT" <<-EOSQL
  CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
  create extension ltree;
EOSQL
