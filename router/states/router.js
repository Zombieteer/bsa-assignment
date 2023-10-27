module.exports = (iocContainer) => {
  const {
    express,
    validators,
    masterValidator,
    controller: stateController,
  } = iocContainer;
  const router = express.Router();

  router.get(`/states`, stateController.getAllStates);

  router.get(
    `/:stateId/residents`,
    masterValidator(validators.validateStateIdParam, "params"),
    stateController.getAllResidentsFromStateId
  );

  return router;
};
