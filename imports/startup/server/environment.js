const debug = require("debug")("env");

const SETTINGS_KEYS_SERVER = [
  "AWS_ACCESS_KEY_ID",
  "AWS_DEFAULT_REGION",
  "AWS_S3_BUCKET",
  "AWS_SECRET_ACCESS_KEY",
  "EMAIL_SEND_FROM",
  "GOOGLE_CREDENTIALS", // used by bigquery module
  "GOOGLE_DATASET",
  "HERE_API_KEY",
  "HERE_APPCODE",
  "HERE_APPID",
  "IBM_FUNCTION_KEY",
  "IBM_FUNCTION_URL",
  "IBM_FUNCTION_CUSTOMER_API",
  "JWT_SECRET",
  "MAIL_SERVICE",
  "METEOR_SETTINGS",
  "OPEN_EXCHANGE_RATES_API",
  "POSTMARK_KEY",
  "REPORTING_TARGET",
  "REDIS_URL",
  "ROOT_URL",
  "SENDGRID_KEY",
  "SENDGRID_MARKETING_KEY", // trigger marketing mails
  "SENTRY"
];
const SETTINGS_KEYS_PUBLIC = [
  "AG_GRID",
  "SENTRY",
  "URL",
  "MAPS_API",
  "HERE_KEY"
];

function reportMissingKeys(area, keys) {
  if (!keys || keys.length === 0) return undefined;
  if (process.env.DOPPLER_TOKEN && process.env.NODE_ENV === "production") {
    throw new Error(
      `we can not start a production environment, Keys are missing from ${area} environment ${keys.join(
        ", "
      )}`
    );
  } else {
    console.warn(
      "these keys are not found in %s environment %s, for full functionally you should add them to environment!",
      area,
      keys.join(", ")
    );
  }
  return undefined;
}

const missingServerKeys = SETTINGS_KEYS_SERVER.filter(key => !process.env[key]);
reportMissingKeys("server", missingServerKeys);

if (process.env.DOPPLER_TOKEN) {
  if (!process.env.METEOR_SETTINGS)
    throw new Error(
      "if doppler is used, we expect to have METEOR_SETTINGS as environment varaible!"
    );

  // check if we have non-parsed settings
  if (process.env.METEOR_SETTINGS.includes("${"))
    throw Error(
      "check meteor settings, there is a problem with the parsing of the secrets"
    );
  const meteorSettings = JSON.parse(process.env.METEOR_SETTINGS);
  debug("meteorSettings %o", Object.keys(meteorSettings));

  if (!meteorSettings.public) {
    reportMissingKeys("meteorSettings", ["public"]);
  } else {
    const missingPublicKeys = SETTINGS_KEYS_PUBLIC.filter(
      key => !meteorSettings.public[key]
    );
    reportMissingKeys("public", missingPublicKeys);
  }
}

if (
  process.env.REPORTING_TARGET &&
  !["test", "dev", "live"].includes(process.env.REPORTING_TARGET)
)
  throw new Error("REPORTING_TARGET should be test,dev or live!");
if (
  process.env.GOOGLE_DATASET &&
  !["reporting", "reportingDev", "reportingTest"].includes(
    process.env.GOOGLE_DATASET
  )
)
  throw new Error(
    "GOOGLE_DATASET should be reporting, reportingDev or reportingTest!"
  );

// double check the live environment

if (
  process.env.NODE_ENV === "production" &&
  process.env.ROOT_URL === "https://app.transmate.eu"
) {
  console.warn("starting up a live server! checking ENV!");

  // we are staring live server now, let's check if we have setup our ENV correctly
  if (process.env.REPORTING_TARGET !== "live")
    throw Error("WRONG LIVE SETTINGS: REPORTING_TARGET");
  if (process.env.MAIL_SERVICE !== "postmark")
    throw Error("WRONG LIVE SETTINGS: MAIL_SERVICE");
  if (process.env.JWT_SECRET.slice(0, 3) !== "pl5")
    throw Error("WRONG LIVE SETTINGS: JWT_SECRET");
  if (process.env.GOOGLE_DATASET !== "reporting")
    throw Error("WRONG LIVE SETTINGS: GOOGLE_DATASET");
}
