/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
import { resetDatabase } from "meteor/xolvio:cleaner";

import TokenGenerationService from "../../server/tokenGeneationSrv.js";

import { AccountService } from "../../services/service";

import { User } from "/imports/api/users/User";

// data
import {
  users,
  createMockUsers,
  createRole
} from "/imports/api/users/testing/server/createMockUsers";

const debug = require("debug")("account:test:token");
const { expect } = require("chai");

const originalTokenValue = process.env.JWT_SECRET;
describe("token", function() {
  let accountId;
  let token;
  before(function() {
    this.timeout(15000);

    resetDatabase({ excludedCollections: ["buffer"] });
    accountId = AccountService.generateId("shipper");
    createMockUsers("planner", accountId);

    createRole("admin");
  });
  before(function() {
    process.env.JWT_SECRET = "123456789123456789";
  });
  after(function() {
    process.env.JWT_SECRET = originalTokenValue;
  });
  it("check if created user has an unverified email", async function() {
    const user = User.first(users.eve.uid);
    const email = user.emails[0];
    expect(email.verified).to.equal(
      false,
      `new account should be unverified email:${JSON.stringify({
        user,
        email
      })}`
    );
  });
  it("generates a token", async function() {
    const priceRequestId = "zgSR5RRWJoHMDSEDy";
    const userId = users.eve.uid;
    const route = {
      page: "priceRequestEdit",
      _id: priceRequestId,
      section: "data"
    };

    const tokenString = await TokenGenerationService.generateToken(
      route,
      userId,
      "login-redirect",
      "10000d"
    );
    expect(tokenString).to.be.a("string");
    debug("store token", tokenString);
    token = tokenString;

    console.log(
      "test token",
      JSON.stringify({
        token,
        accountId,
        userId,
        route
      })
    );
  });

  it("decodes a token", async function() {
    const decodedToken = await TokenGenerationService.decodeToken(token);
    expect(decodedToken).to.be.a("object");
    expect(decodedToken.userId).to.equal(users.eve.uid);
    const user = User.first(users.eve.uid);
    const email = user.emails[0];
    expect(email.verified).to.equal(
      true,
      `email should be verified now:${JSON.stringify({ user, email })}`
    );
  });

  it("throws error on decoding a wrong token", async function() {
    const decodedToken = await TokenGenerationService.decodeToken(`${token}-`);
    expect(decodedToken.err).to.be.a("object");
    expect(decodedToken.userId).to.equal(undefined);
  });

  it("both token actions in chain", async function() {
    const tokenString = await TokenGenerationService.generateToken(
      "priceRequest",
      users.eve.uid,
      "login-redirect"
    );
    const decodedToken = await TokenGenerationService.decodeToken(tokenString);
    expect(decodedToken).to.be.a("object");
    expect(decodedToken.userId).to.equal(users.eve.uid);
    expect(decodedToken.meteorToken.token).to.be.a("string");
  });
});
