const dao = require("./model");

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

    const residents = await dao.getAllResidentsFromStateId(stateId);

    return res.json({ count: residents.length, residents });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStates,
  getAllResidentsFromStateId,
};
