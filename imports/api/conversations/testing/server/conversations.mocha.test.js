/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { resetCollections } from "/imports/api/zz_utils/services/server/loadFixtures/resetCollection";
import { resolvers } from "../../apollo/resolvers";
import { expect } from "chai";

const ACCOUNT_ID = "S65957";
const USER_ID = "jsBor6o3uRBTFoRQY";
const CONVERSATION_ID = "uMgJhBPC96uSvKepo";

let defaultMongo;
describe("conversations", function() {
  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo");
      await defaultMongo.connect();
    }

    const resetDone = await resetDb({ resetUsers: true });
    if (!resetDone) throw Error("reset was not possible, test can not run!");
  });
  describe("createConversation", function() {
    beforeEach(function() {
      return resetCollections([
        "users",
        "accounts",
        "conversations",
        "comments"
      ]);
    });
    const context = {
      userId: USER_ID,
      accountId: ACCOUNT_ID
    };
    it.skip("[createConversation]", async function() {
      const args = {
        input: {
          participants: ["jsBor6o3uRBTFoRQY"],
          subject: "new conversation",
          message: "message",
          documentType: "tender",
          documentId: "B28hKhA2g5Fs9pdd3",
          broadcast: false
        }
      };
      const res = await resolvers.Mutation.createConversation(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res.broadcast).to.equal(args.input.broadcast);
      expect(res.subject).to.equal(args.input.subject);
      expect(res.message).to.equal(args.input.message);
      expect(res.documentId).to.equal(args.input.documentId);
      expect(res.documentType).to.equal(args.input.documentType);
    });
  });
  describe("updateConversationComment", function() {
    beforeEach(function() {
      return resetCollections([
        "users",
        "accounts",
        "conversations",
        "comments"
      ]);
    });
    const context = {
      userId: USER_ID,
      accountId: ACCOUNT_ID
    };
    it.skip("[updateConversationComment]", async function() {
      const args = {
        input: {
          commentId: "uGoeZWp4iZ2yNRivu",
          value: "cdfrs"
        }
      };
      const res = await resolvers.Mutation.updateConversationComment(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("string");
    });
  });
  describe("addConversationComment", function() {
    beforeEach(function() {
      return resetCollections([
        "users",
        "accounts",
        "conversations",
        "comments"
      ]);
    });
    const context = {
      userId: USER_ID,
      accountId: ACCOUNT_ID
    };
    it("[addConversationComment]", async function() {
      const args = {
        input: {
          conversationId: CONVERSATION_ID,
          value: "value"
        }
      };
      const res = await resolvers.Mutation.addConversationComment(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("string");
    });
  });
  describe("removeConversationComment", function() {
    beforeEach(function() {
      return resetCollections([
        "users",
        "accounts",
        "conversations",
        "comments"
      ]);
    });
    const context = {
      userId: USER_ID,
      accountId: ACCOUNT_ID
    };
    it.skip("[removeConversationComment]", async function() {
      const args = {
        commentId: "uGoeZWp4iZ2yNRivu"
      };
      const res = await resolvers.Mutation.removeConversationComment(
        null,
        args,
        context
      );
      expect(res).to.not.equal(undefined);
      expect(res).to.be.a("string");
    });
  });
});
