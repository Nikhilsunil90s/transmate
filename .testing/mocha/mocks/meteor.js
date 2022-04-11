const debug = require("debug")("mock:meteor");


const { Mongo } = require("../DefaultMongo");
module.exports = {
  Meteor: {
    isClient: false, //server testing in mocha
    isServer: true,
    call: (...args) => debug("meteor.call", { args }),
    setUserId: userId => {
      this.userId = userId;
    },
    userId: () => {throw Error("don't call Meteor.userId() on server, use context!")},
    users: new Mongo.Collection("users"),
    roles: new Mongo.Collection("roles"),
    roleAssignment: new Mongo.Collection("role-assignment"),
    user: () => {throw Error("don't call Meteor.user() on server, use context!")},
    subscribe: () => ({ ready: () => true }),
    settings: { jwt_key: "abc0123456789", ...JSON.parse(process.env.METEOR_SETTINGS || {}) },
    absoluteUrl: url => {
      const base = process.env.ROOT_URL || "http://localhost:3000";
      return base + "/" + url;
    },
    startup: (...args) => debug("meteor.startup called", { args }),
    wrapAsync: () => {
      throw Error("this code needs to be refactored to work in pure js");
    },
    Error: Error
  }
};
