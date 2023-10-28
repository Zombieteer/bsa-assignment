const db = require("../../utils/db");

const getAllStates = (_) =>
  db.any(
    `select id, state_name from states where is_deleted = false order by 1`
  );

const getAllResidentsFromStateId = async (stateId) => {
  return await db.any(
    `
    select first_name, last_name from residents r
    where r.state_id = $1 and r.is_dead = false
    `,
    [stateId]
  );
};

module.exports = {
  getAllStates,
  getAllResidentsFromStateId,
};
