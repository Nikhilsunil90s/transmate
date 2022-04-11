/* eslint-disable camelcase */
import { Mongo } from "meteor/mongo";
import Model from "../Model";

/** stores all global settings of the app
 * better to store in DB, no need for rebuild if extra topics are needed
 */
class Settings extends Model {}

Settings._collection = new Mongo.Collection("settings");

export { Settings };
