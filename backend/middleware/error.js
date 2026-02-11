const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server Error";

  // wrong mongodb id error
  if (err.name === "CastError") {
    const msg = `Resources not found with this id.. Invalid ${err.path}`;
    return res.status(400).json({ success: false, message: msg });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const msg = `Duplicate key ${Object.keys(err.keyValue)} Entered`;
    return res.status(400).json({ success: false, message: msg });
  }

  // wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const msg = `Your url is invalid, please try again later`;
    return res.status(400).json({ success: false, message: msg });
  }

  // jwt expired
  if (err.name === "TokenExpiredError") {
    const msg = `Your Url is expired, please try again later!`;
    return res.status(400).json({ success: false, message: msg });
  }

  const response = { success: false, message };
  if (process.env.NODE_ENV !== "PRODUCTION") {
    response.stack = err.stack;
  }
  res.status(statusCode).json(response);
};
