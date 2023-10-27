module.exports = function (iocContainer) {
    const { express } = iocContainer;
  
    const router = express.Router();
  
    router.use("/api", require("./states")(iocContainer));
  
    return router;
  };
  