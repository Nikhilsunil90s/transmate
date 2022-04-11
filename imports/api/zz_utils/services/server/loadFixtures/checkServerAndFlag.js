// white listed servers:
const LOCAL_DBS = [
  "mongodb://127.0.0.1:3051/meteor",
  "mongodb://127.0.0.1:3001/meteor",
  "mongodb://localhost:3051/meteor",
  "mongodb://localhost:3001/meteor",
  "mongodb://localhost:27017/mochaTest",
  "mongodb+srv://testing:P415zPFfjrAFfi1u@cluster0.v0qgl.mongodb.net/transmate?retryWrites=true&w=majority"
];
const debug = require("debug")("db:reset:check");

export const canResetCollections = () => {
  let isTestDb =
    process.env.TEMP_DB || LOCAL_DBS.includes(process.env.MONGO_URL);

  if (!isTestDb && process.env.MONGO_URL.includes("mochaTest")) {
    // check if user is "mochaTest"

    isTestDb = true;
  }
  debug(
    "can  isTestDb %o , reset %o, temp db %o",
    isTestDb,
    process.env.RESET_DATABASE,
    process.env.TEMP_DB
  );
  return (
    process.env.RESET_DATABASE &&
    process.env.RESET_DATABASE.toLowerCase() === "true" &&
    isTestDb
  );
};
