import { init as sentryInit, setTag as sentrySetTag } from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { Meteor } from "meteor/meteor";
import get from "lodash.get";

const debug = require("debug")("errorLogging");

// eslint-disable-next-line func-names
Meteor.startup(function() {
  debug("set sentry with public %o", get(Meteor, "settings.public"));
  sentryInit({
    dsn: Meteor.settings.public.SENTRY,
    integrations: [new Integrations.BrowserTracing()],
    environment: get(Meteor, "settings.public.SERVER_NAME"),
    release: get(Meteor, "settings.public.RELEASE_NAME"),
    tracesSampleRate: 0.1
  });
  sentrySetTag("server", get(Meteor, "settings.public.URL"));
});
