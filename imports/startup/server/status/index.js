import { WebApp } from "meteor/webapp";
import express from "express";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction.js";
import { bigQuery } from "@transmate-eu/bigquery_module_transmate";
import { postmarkTest } from "/imports/api/email/server/send-postmark";

const {
  RedisConnection,
  MongoConnection
} = require("@transmate-eu/ibm-function-basis");

let redis;
if (process.env.REDIS_URL) {
  redis = new RedisConnection(process.env.REDIS_URL);
}
const app = express();
app.get("/status/app", (req, res) => {
  res
    .status(200)
    .set("Cache-Control", "no-store")
    .send(`app running`);
});
app.get("/status/redis", async (req, res) => {
  try {
    const { result, latency } = await redis.test();
    if (result && result.toUpperCase() === "OK")
      res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({ result, latency, ts: new Date() });
    else {
      res
        .status(500)
        .set("Cache-Control", "no-store")
        .send(`redis not running`);
    }
  } catch (e) {
    res
      .status(503)
      .set("Cache-Control", "no-store")
      .send(e.message);
  }
});
app.get("/status/mongo", async (req, res) => {
  try {
    const mongo = new MongoConnection(process.env.MONGO_URL);
    const { result, latency } = await mongo.test();
    if (result && result.toUpperCase() === "OK")
      res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({ result, latency, ts: new Date() });
    else {
      res
        .status(500)
        .set("Cache-Control", "no-store")
        .send(`mongo not running`);
    }
  } catch (e) {
    res
      .status(503)
      .set("Cache-Control", "no-store")
      .send(e.message);
  }
});

app.get("/status/functions", async (req, res) => {
  try {
    const { result, elapsed } = await callCloudFunction("test", {});
    if (result && result.toUpperCase() === "OK")
      res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({ result, elapsed, ts: new Date() });
    else {
      res
        .status(500)
        .set("Cache-Control", "no-store")
        .send(`functions not running`);
    }
  } catch (e) {
    res
      .status(503)
      .set("Cache-Control", "no-store")
      .send(e.message);
  }
});

app.get("/status/bq", async (req, res) => {
  try {
    const { result, elapsed } = await bigQuery.test();
    if (result && result.toUpperCase() === "OK")
      res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({ result, elapsed, ts: new Date() });
    else {
      res
        .status(500)
        .set("Cache-Control", "no-store")
        .send(`bq not running`);
    }
  } catch (e) {
    res
      .status(503)
      .set("Cache-Control", "no-store")
      .send(e.message);
  }
});

app.get("/status/email", async (req, res) => {
  try {
    const { result, elapsed } = await postmarkTest();
    if (result && result.toUpperCase() === "OK")
      res
        .status(200)
        .set("Cache-Control", "no-store")
        .json({ result, elapsed, ts: new Date() });
    else {
      res
        .status(500)
        .set("Cache-Control", "no-store")
        .send(`bq not running`);
    }
  } catch (e) {
    res
      .status(503)
      .set("Cache-Control", "no-store")
      .send(e.message);
  }
});
WebApp.connectHandlers.use(app);
