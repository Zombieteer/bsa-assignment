#!/bin/bash
set -e

DB_HOST=db
PG_PORT=5432
DB_NAME=bsadb
DB_PASSWORD=bsa
DB_USER=bsa

until nc -z "db" "5432"; do
  >&2 echo "Service at db:5432 is unavailable - sleeping"
  sleep 1
done

PGPASSWORD="$DB_PASSWORD" psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -p $PG_PORT -f schema/drop-tables.sql
PGPASSWORD="$DB_PASSWORD" psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -p $PG_PORT -f schema/schema.sql

echo "Downloading the zip file from S3..."
wget --no-check-certificate https://backend-assignment.s3.us-east-2.amazonaws.com/backend-assignment.zip
echo "Extracting the zip file..."
unzip backend-assignment.zip
rm -rf backend-assignment.zip

# save states data
#for file in ./backend-assignment/states/*.geojson; do
#    node ./scripts/insertStates.js "$file"
#done

# save individuals data
node ./scripts/insertIndividuals.js "./backend-assignment/individuals.csv"

# remove extracted files
rm -rf backend-assignment
rm -rf __MACOSX

echo "Done!"