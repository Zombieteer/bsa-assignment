FROM postgis/postgis:12-3.1

ENV POSTGRES_DB=bsadb
ENV POSTGRES_USER=bsa
ENV POSTGRES_PASSWORD=bsa

RUN apt-get update \
    && apt-get install -y \
        wget \
        unzip \
    && rm -rf /var/lib/apt/lists/*

COPY ./scripts/init.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init.sh
