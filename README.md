docker build -t bsa-server -f bsa-server.Dockerfile .
docker run -p 3003:3003 -d bsa-server

docker build -t bsa-db -f bsa-db.Dockerfile .
docker run -p 5432:5432 -d bsa-db
