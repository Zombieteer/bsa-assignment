const promise = require("bluebird");
const pgPromise = require("pg-promise");
const create = (databaseUrl) => {
  const initOptions = {
    promiseLib: promise,
    error(error, e) {
      console.error(e.query);
      return { ...error, DB_ERROR: true, query: e.query };
    },
  };

  const pgp = pgPromise(initOptions);

  const db = pgp({
    connectionString: databaseUrl,
    max: 500,
    idleTimeoutMillis: 10000,
  });

  return db;
};

const BSADB = "postgres://bsa:bsa@db:5432/bsadb";

module.exports = create(BSADB);
