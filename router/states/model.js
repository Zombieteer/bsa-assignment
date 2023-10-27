const db = require("../../utils/db");

const getAllStates = (_) =>
  db.any(
    `select id, state_name from states where is_deleted = false order by 1`
  );

const getAllResidentsFromStateId = async (stateId) => {
  return await db.any(
    `
        select  first_name, last_name from residents r 
        join states s on ST_Intersects(s.state_polygon::geometry, r.geog::geometry)
        and s.id = $1
    `,
    [stateId]
  );
};

module.exports = {
  getAllStates,
  getAllResidentsFromStateId,
};
