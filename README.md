# BSA Assignment

## API Doc

**API doc can be found in `api_doc.yaml`**

Basically there are 2 APIs

1. http://18.209.164.217:3003/api/state -> <em>Response is states with there state ids</em>
2. http://18.209.164.217:3003/api/:stateId/residents -> <em>Response is count of residents and list of residents from that state</em>.

## Folder Structure

```
├── middlewares
├── router
│   ├── states
│   │   ├── controller.js
│   │   ├── index.js
│   │   ├── routes.js
│   │   ├── model.js
│   │   ├── validator.js
│   ├── index.js
├── schemas
│   ├── drop-tables.sql
│   ├── schema.sql
├── scripts
│   ├── init.sh
│   ├── refresh.sh
├── utils
│   ├── db.js
│   ├── errors.js
├── Dockerfile
├── .gitignore
├── package.json
└── README.md
```

## Local Setup

To set up the project locally, follow these steps:

1. Clone the repository: git clone https://github.com/Zombieteer/bsa-assignment.git
2. Navigate to the project directory: `cd bsa-assignment`
3. Install the dependencies using node 18: `npm install`
4. Make sure you have postgresql 12 running on your machine
5. Run `init.sh` and `refresh.sh` from `./scripts`
6. Start the server: `npm run dev`

The server should now be running locally on `http://localhost:3003`.

## Docker

To run the project using Docker and docker-compose, make sure you have Docker installed on your machine.

There are 3 major docker files

1. `bsa-server.Dockerfile` which handles the node server.
1. `bsa-db.Dockerfile` which handles the postgres database and postgis extention
1. `bsa-jobs.Dockerfile` which runs for the first time to initiate the database tables and populate the data from `s3`

All these files are used in `docker-compose.yaml` to run in specific order.

Then, follow these steps:

1. Clone the repository: git clone https://github.com/Zombieteer/bsa-assignment.git
2. Navigate to the project directory: `cd bsa-assignment`
3. Run `docker-compose up --build -d` to **build and run the images**.
4. This will also init and refresh the database.

The server should now be running inside a Docker container on http://localhost:3003.

## AWS Architecture and Deployment

```
The Github code repo is pulled in an EC2 instance and run using docker-compose.

Currently hosted on __18.209.164.217:3003__
```

To deploy the project on AWS, follow these steps:

## Caveats
1. Deploying on EC2 instance is not via CI/CD pipeline, need to pull from repo on cloud everytime we make a change in code.
2. Environment variables are not used, everything is hard coded. Can be easily achieved by using `dotenv`.