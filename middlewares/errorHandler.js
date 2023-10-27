module.exports = (prefix) =>
  function (error, req, res, next) {
    if (error.message === "INVALID_JSON_BODY_PARSER") {
      return res.status(400).send("bad json");
    }

    if (error.code === "EBADCSRFTOKEN" && !res.headersSent) {
      return res.status(403).send("INVALID_REQUEST_TOKEN");
    }

    if (error.name === "VALIDATION_ERROR" && !res.headersSent) {
      return res.status(error.code).json({ error: error.response });
    }

    // const query = error.query ? error.query.toString() : null
    // const code = error.code || null
    const source = error.DB_ERROR
      ? `${prefix}_DB_ERROR`
      : `${prefix}_API_ERROR`;

    // const message = JSON.stringify({
    //   message: error.message,
    //   url: req.url,
    //   method: req.method
    // })

    // db.logs.logError(message, error.stack, req.id, req.currentUser && req.currentUser.id, source, query, code)

    if (error.name === "UNAUTHORISED" && !res.headersSent) {
      return res.status(error.code).end(error.response);
    }

    if (error.name === "API_ERROR" && !res.headersSent) {
      return res
        .status(error.code)
        .json({ error: error.error || error.message });
    }

    if (error.message && !res.headersSent) {
      console.log(error);
      if (
        typeof error.message === "string" &&
        error.message.includes("VALIDATION_ERROR")
      ) {
        const errors = JSON.parse(
          error.message.replace("VALIDATION_ERROR:", "")
        );
        return res.status(400).json({ error: errors });
      } else if (
        typeof error.message === "string" &&
        error.message.includes("ERROR:")
      ) {
        return res
          .status(400)
          .json({ error: error.message.replace("ERROR:", "") });
      }
      return res.status(500).json({ error: error.message });
    }

    console.log(source, error);

    if (!res.headersSent) {
      res.status(500).send("An error occured");
    }
  };
