/* eslint-disable no-underscore-dangle */
import { Mongo } from "meteor/mongo";
import Model from "../Model";

class WorkerNotifications extends Model {}

WorkerNotifications._collection = new Mongo.Collection("worker.notifications", {
  idGeneration: "MONGO"
});

export { WorkerNotifications };
