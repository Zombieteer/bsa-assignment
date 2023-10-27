const router = require("./router");
const validators = require("./validators");
const controller = require("./controller");

const getRouter = (iocContainer) => {
  return router({
    ...iocContainer,
    validators,
    controller,
  });
};

module.exports = getRouter;
