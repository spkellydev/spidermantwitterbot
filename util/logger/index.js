const path = require("path");
const logger = require("logger").createLogger(
  path.join(__dirname, "../logger/logs.txt")
);

logger.bug = (...data) => {
  logger.setLevel("debug");

  if (typeof data === "Array") {
    logger.debug(...data);
  } else {
    logger.debug(data);
  }
};

module.exports = logger;
