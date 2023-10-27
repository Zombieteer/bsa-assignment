class ValidationError extends Error {
    constructor(e) {
      super(e);
      this.name = "VALIDATION_ERROR";
      this.code = 400;
      this.response = e;
    }
  }
  
  class Unauthorised extends Error {
    constructor(e) {
      super(e);
      this.name = "UNAUTHORISED";
      this.code = 401;
      this.response = e;
    }
  }
  
  class ApiError extends Error {
    constructor(e) {
      super(e);
      this.name = "API_ERROR";
      this.code = 400;
      this.error = e.message;
    }
  }
  
  class ServerError extends Error {
    constructor(e) {
      super(e);
      this.name = "SERVER_ERROR";
      this.code = 500;
      this.error = e.message;
    }
  }
  
  module.exports = {
    ValidationError,
    Unauthorised,
    ApiError,
    ServerError,
  };
  