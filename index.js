const express = require("express");
const app = express();
const middlewares = require("./middlewares");
const router = require("./router");

const startServer = async () => {
  const masterValidator = middlewares.masterValidator;

  const iocContainer = {
    express,
    middlewares,
    masterValidator,
  };

  const PORT = 3003;

  app.use(express.json({ limit: "50mb" }));
  app.use(middlewares.logger(false));
  app.get("/ping", async (_req, res) => res.end("pong"));
  app.use(router(iocContainer));
  app.use(middlewares.errorHandler("BSA_SERVER"));

  app.listen(PORT, "0.0.0.0", () =>
    console.log(`BSA server started on port ${PORT}`)
  );
};

startServer();
