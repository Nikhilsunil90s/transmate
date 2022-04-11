const debug = require("debug")("mock:accounts");
const { get } = require("jquery");
const { Mongo, createId } = require("../DefaultMongo");

module.exports = {
  Accounts: {
    resetPassword: () => { },
    setPassword: () => { },

    _generateStampedLoginToken(...args) {
      debug("_generateStampedLoginToken", args);
      return 1;
    },
    _insertLoginToken(userId, meteorToken) {
      debug("_insertLoginToken", userId, meteorToken);
      return true;
    },
    async sendEnrollmentEmail(userId) {
      debug("sendEnrollmentEmail", userId);
      return true;
    },
    
    findUserByEmail(email) {
      const user = new Mongo.Collection("users").findOne({
        "emails.0.address": email
      });
      if (user) return user; // case sensitive works

      return new Mongo.Collection("users").findOne({
        "emails.0.address": { $regex: new RegExp(email), $options: "i" }
      });
    },
    async findUserByEmail_async(email) {
      let user
      user = await new Mongo.Collection("users").findOne(
        {
          "emails.0.address": email
        },
        { fields: { _id: 1, profile: 1, emails: 1 } }
      );

      if (!user) {
        // try case insensitive
        user = await new Mongo.Collection("users").findOne(
          {
            "emails.0.address": { $regex: new RegExp(email), $options: "i" }
          },
          { fields: { _id: 1, profile: 1, emails: 1 } }
        );
      }
      if (user) return { ...user, email: user.emails[0].address }; // case sensitive works
      return null;
    },

    async createUser(user) {
      user.emails = [{ address: user.email }];
      const result = await new Mongo.Collection("users").insert(user);
      debug("user creation done:", result.result);
      return typeof result === "string" ? result : result.insertedId;
    }
  }
};
