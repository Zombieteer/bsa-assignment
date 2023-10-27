FROM --platform=linux/amd64 node:18
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        wget \
        unzip \
        netcat-traditional  \
        postgresql \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
RUN echo npm --verison
WORKDIR /usr/src/app
COPY . .
RUN chmod +x scripts/refreshdb.sh