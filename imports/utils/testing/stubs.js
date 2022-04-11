/* eslint-disable import/no-mutable-exports */
import { Meteor } from "meteor/meteor";

const sinon = require("sinon");

// export const stubUser2 = () => {
//   Factory.define("user", Meteor.users, {
//     _id: "Dsqp3CRYjFpF8rQbh",
//     profile: {
//       first: "firstTest",
//       last: "lastTest"
//     },
//     emails: [{ address: "test@test.com" }]
//   });
// };

export const stubUser = currentUserId => {
  if (!Meteor.userId()) {
    // dont stub twice just in case
    sinon.stub(Meteor, "userId").callsFake(() => currentUserId);
    sinon
      .stub(Meteor, "user")
      .callsFake(() => Meteor.users.findOne({ _id: currentUserId }));
  }
  console.log("Stub user check:", Meteor.userId());
};

export const restoreUser = () => {
  // to avoid unrecognized bugs ensure the method is stubbed by checking for restore method
  if (Meteor.userId.restore) Meteor.userId.restore();
  if (Meteor.user.restore) Meteor.user.restore();
};

// Remember to double check this is a test-only file before
// adding a method like this!
Meteor.methods({
  stub(currentUser) {
    check(currentUser, String);
    console.log("Stubbing on server", currentUser);
    stubUser(currentUser);
  },
  restore() {
    restoreUser();
  }
});

let createStubs;
let restoreStubs;

if (Meteor.isClient) {
  // Create a second connection to the server to use to call
  // test data methods. We do this so there's no contention
  // with the currently tested user's connection.
  const testConnection = Meteor.connect(Meteor.absoluteUrl());
  const cb = (err, res) => {
    console.log(err, res);
  };
  createStubs = async currentUser => {
    // hey, we have to stub current user both on client and server
    console.info("Stubbing on client", currentUser);
    stubUser(currentUser); // stub on client
    await testConnection.call("stub", currentUser, cb); // stub on server
  };
  restoreStubs = async cb2 => {
    restoreUser();
    await testConnection.call("restore", cb2);
  };
} else {
  // used in server side tests
  createStubs = currentUser => Meteor.call("stub", currentUser);
  restoreStubs = () => Meteor.call("restore");
}

export { createStubs, restoreStubs };
