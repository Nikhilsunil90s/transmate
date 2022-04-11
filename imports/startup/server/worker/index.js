import { WebApp } from "meteor/webapp";
import express from "express";

const cookieSession = require("cookie-session");
const debug = require("debug")("bull:monitor");
const { RedisConnection } = require("@transmate-eu/ibm-function-basis");
const Queue = require("bull");

const app = express();

// Setting up EJS Views

const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

function setUser(accessToken, refreshToken, profile, cb) {
  debug("set user");
  return cb(null, profile);
}
const REDIS_URI = process.env.REDIS_URL;
if (
  process.env.AUTH2_GOOGLE_CLIENT_ID &&
  process.env.AUTH2_GOOGLE_CLIENT_SECRET &&
  REDIS_URI
) {
  const isLoggedIn = (req, res, next) => {
    debug("check login status?");
    if (req.user) {
      debug("logged in!", req.user.displayName);
      if (
        ["jan@transmate.eu", "philip@transmate.eu"].includes(
          req.user.emails[0].value
        )
      )
        next();
      else {
        res.status(400).send(`${req.user.displayName} not allowed`);
      }
    } else {
      debug("not logged in!");

      // res
      //   .status(200)
      //   .send(
      //     `login : <a class="button google" href="/worker/auth/google">Sign in with Google</a>`
      //   );

      res.redirect("/worker/auth/google");
    }
  };
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  const logRequest = (req, res, next) => {
    debug("logRequest", req.baseUrl, req.params);
    next();
  };

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.AUTH2_GOOGLE_CLIENT_ID,
        clientSecret: process.env.AUTH2_GOOGLE_CLIENT_SECRET,
        callbackURL: "/worker/auth/google/callback",
        scope: ["profile", "email"]
      },
      setUser
    )
  );

  const redisOptions = {
    redis: RedisConnection.connectionParams(REDIS_URI)
  };
  const redis = new RedisConnection(REDIS_URI);

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/worker");

  const { setQueues } = createBullBoard({
    queues: [],
    serverAdapter
  });

  const queueNames = [];
  let client; // redis client
  const prefix = process.env.BULL_PREFIX || "bull";

  // eslint-disable-next-line no-inner-declarations
  function refreshQueues() {
    debug("Refreshing Queues");
    client.keys(`${prefix}:*`, (_err, keys) => {
      keys.sort().forEach(key => {
        const queueName = key.replace(/^.+?:(.+?):.+?$/, "$1");
        if (!queueNames.includes(queueName)) {
          debug("add queue_name", queueName);
          const queue = new Queue(queueName, redisOptions);
          const queueAdapter = new BullAdapter(queue);
          setQueues([queueAdapter]);
          queueNames.push(queueName);
        }
      });
    });
  }

  const run = async () => {
    client = await redis.connect();
    setInterval(refreshQueues, process.env.REFRESH_INTERVAL || 10000);
    app.use(
      "/worker",
      cookieSession({
        name: "google-auth-session",
        keys: ["key1", "key2"]
      }),
      logRequest
    );
    app.use("/worker", passport.initialize(), logRequest);
    app.use("/worker", passport.session(), logRequest);

    app.get("/worker/auth/google", passport.authenticate("google"), logRequest);

    app.get(
      "/worker/auth/google/callback",
      passport.authenticate("google", {
        successReturnToOrRedirect: "/worker",
        failureRedirect: "/worker"
      }),
      function(req, res) {
        debug("login ok! send back home!");

        // Successful authentication, redirect home.
        res.redirect("/worker");
      }
    );

    refreshQueues();
    console.log("startup worker monitor on /worker");
    app.use(
      cookieSession({
        name: "google-auth-session",
        keys: ["key1", "key2"]
      })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.use("/worker", isLoggedIn, serverAdapter.getRouter());
    WebApp.connectHandlers.use(app);
  };

  run().catch(e => console.error(e));
}
