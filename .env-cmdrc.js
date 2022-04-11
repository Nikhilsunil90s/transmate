const debug = require("debug")("env");
const { getSecrets } = require("@transmate-eu/secrets");
const cfenv = require("cfenv");
const appEnv = cfenv.getAppEnv();
const { Url } = require('url');

async function getSettings() {
  try {
    if (
      !process.env.DOPPLER_TOKEN ||
      !process.env.DOPPLER_TOKEN.includes("_meteor")
    ) {
      console.warn(
        "to use db connections, set a correct doppler token , it should be a meteor specic key including _meteor"
      );
    }

    debug("get obj");
    let settingsObject = {
      SERVER_NAME: appEnv.name || "local",
      DISABLE_CLIENT_STATS: true
    };
    try {
      settingsObject = {
        ...settingsObject,
        ...(await getSecrets({ populateEnv: false }))
      };
      debug("settings received %o", Object.keys(settingsObject));
    } catch (err) {
      console.error(err.message);
    }
    // set release name on client if available
    if (
      settingsObject &&
      settingsObject.METEOR_SETTINGS &&
      settingsObject.METEOR_SETTINGS
    ) {
      // console.log("add server and release name.")
      const meteorSettings = JSON.parse(settingsObject.METEOR_SETTINGS); // must be parseable!
      if (!meteorSettings.public) meteorSettings.public = {};
      meteorSettings.public.SERVER_NAME = appEnv.name || "localhost";
      meteorSettings.public.RELEASE_NAME =
        process.env.RELEASE_NAME || "testing";
      settingsObject.METEOR_SETTINGS = JSON.stringify(meteorSettings);
    }
    // console.log(settingsObject);
    // add oplog for live db (assumes local db access)
    if (typeof settingsObject.MONGO_URI_LIVE === "string" && settingsObject.MONGO_URI_LIVE.includes("databases.appdomain.cloud") && settingsObject.MONGO_URI_LIVE.includes("/transmate?")) {
      settingsObject.MONGO_LIVE_OPLOG_URI = settingsObject.MONGO_URI_LIVE.replace("/transmate?", "/local?");
    }
    if (typeof settingsObject.MONGO_URI_TEST === "string" && settingsObject.MONGO_URI_TEST.includes("databases.appdomain.cloud") && settingsObject.MONGO_URI_TEST.includes("/transmate?")) {
      settingsObject.MONGO_TEST_OPLOG_URI = settingsObject.MONGO_URI_TEST.replace("/transmate?", "/local?");
    }
    return {
      default: settingsObject,
      test: { MONGO_URL: settingsObject.MONGO_URI_TEST, MONGO_OPLOG_URL: settingsObject.MONGO_TEST_OPLOG_URI },
      live: { MONGO_URL: settingsObject.MONGO_URI_LIVE, MONGO_OPLOG_URL: settingsObject.MONGO_LIVE_OPLOG_URI },
      local: {
        MONGO_URL: undefined,
        MOCK_runShipPriceLookup: true,
        MOCK_CheckAddress: true,
        RESET_DATABASE: true
      },
      mocha: {
        MAIL_SERVICE: "console",
        REPORTING_TARGET: "dev",
        JWT_SECRET: "123456789ABC",
        AWS_S3_BUCKET: "testBucket",
        GOOGLE_DATASET: "reportingDev",
        REDIS_URL: "redis://localhost:6379/5",
        METEOR_SETTINGS: JSON.stringify({
          public: {}
        })
      },
      mock: {
        MOCK_generateDoc: true,
        MOCK_getLabelOptions: true,
        MOCK_confirmLabelOption: true,
        MOCK_rates: true,
        MOCK_runShipPriceLookup: true,
        MOCK_CheckAddress: true
      },
      atlas: {
        MONGO_URL: process.env.MONGO_URI_ATLAS,
        DEFAULT_MONGO: true,
        RESET_DATABASE: true
      },
      redis: {
        PROCESS_WORKER_JOBS: true,
        REDIS_URL: "rediss://127.0.0.1:6379"
      },
      dhlLabelTest: {
        DEBUG_DHL: false, // set to true for local label storage, if false >> AWS storage
        AWS_SECRET_ACCESS_KEY: settingsObject.AWS_SECRET_ACCESS_KEY,
        AWS_DEFAULT_REGION: settingsObject.AWS_DEFAULT_REGION,
        AWS_ACCESS_KEY_ID: settingsObject.AWS_ACCESS_KEY_ID,
        AWS_S3_BUCKET: settingsObject.AWS_S3_BUCKET,
        IBM_FUNCTION_URL: settingsObject.IBM_FUNCTION_URL,
        IBM_FUNCTION_KEY: settingsObject.IBM_FUNCTION_KEY
      }
    };
  } catch (e) {
    console.error(e);
    return {
      default: { error: e.message },
      mocha: {}
    };
  }
}

module.exports = getSettings();
