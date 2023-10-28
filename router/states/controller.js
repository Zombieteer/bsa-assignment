const pgp = require("pg-promise")();
const db = require("../../utils/db");
const dao = require("./model");
const QueryStream = require("pg-query-stream");
const JSONStream = require('JSONStream');

const getAllStates = async (req, res, next) => {
  try {
    const states = await dao.getAllStates();
    return res.json({ states });
  } catch (error) {
    next(error);
  }
};

const getAllResidentsFromStateId = async (req, res, next) => {
  try {
    const stateId = req.params.stateId;

    const query = pgp.as.format(
      `select first_name, last_name from residents r
        where r.state_id = $1 and r.is_dead = false`,
      [stateId]
    );

    const qs = new QueryStream(query);

    db.stream(qs, (s) => {
      s.pipe(JSONStream.stringify()).pipe(res);
    })
      .then((data) => {
        console.log(
          "Total rows processed:",
          data.processed,
          "Duration in milliseconds:",
          data.duration
        );
      })
      .catch((error) => {
        console.log("ERROR:", error);
        res.status(400).json({ error: error });
      });

    // const residents = await dao.getAllResidentsFromStateId(stateId);

    // return res.json({ count: residents.length, residents });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStates,
  getAllResidentsFromStateId,
};
