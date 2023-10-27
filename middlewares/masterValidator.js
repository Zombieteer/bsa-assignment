const Validator = require("fastest-validator");
const v = new Validator();
const errors = require("../utils/errors");

module.exports = (schema, type) => (req, res, next) => {
  const isValidated = v.compile(schema)(req[type]);
  if (isValidated !== true) {
    console.log(isValidated, "isValidated");
    throw new errors.ValidationError({
      message: "Check all fields",
      errors: isValidated,
    });
  }
  next();
};
