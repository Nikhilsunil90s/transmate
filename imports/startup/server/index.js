// set env
import "./environment";

// checking the IE
import "./check-browser";

// Set up some rate limiting and other important security settings.
import "./ddp-rate-limits";

// This defines all the collections, publications and methods that the application provides
// as an API to the client.
import "./register-api.js";

// Configurations
import "./accounts/accounts-config"; // accounts
import "./accounts/accounts-email.js"; // accounts
import "./migrations/_imports.js"; // migrations
import "./uploads/_imports.js"; // upload configurations
import "./apollo/index.js";
import "./worker/index.js"; // monitor bull queues
import "./status/index.js"; // status services
import "/imports/api/notifications/server/hooks/_imports";

// import Meteor.startup scripts
import "./meteorStartup/_imports.js";

const debug = require("debug")("meteor:startup");

debug("current env settings are %o", process.env.NODE_ENV);
