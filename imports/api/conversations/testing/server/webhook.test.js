/* eslint-disable func-names */
import { Comments } from "/imports/api/comments/Comments";
import { Conversation } from "/imports/api/conversations/Conversation";
import { processComment } from "/imports/api/conversations/services/processWebhookMessage.js";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

// import get from "lodash.get";

import {
  conversationData,
  priceRequestData
} from "../conversation-test-data.js";

const debug = require("debug")("webhook:conversation:tests");

const { expect } = require("chai");

describe("webhook", function() {
  let conversationId;
  before(function() {
    conversationId = null;

    // clean db
    debug("clean db start");
    Conversation._collection.remove({});
    Comments._collection.remove({});
    PriceRequest._collection.remove({});

    // insert pr obj with limited fields for testing
    PriceRequest._collection.rawCollection().insertOne(priceRequestData);
    debug("clean db finished");
  });
  it("setup 1 conversation with 1 comment", function() {
    // create conversation for normal conversation
    debug("set data in db", conversationData);
    const conversation = Conversation.create({ ...conversationData });
    debug("result of insert of conversation", conversation);
    conversationId = conversation._id;
    debug("use conversationId %s in tests", conversationId);
    const comments = Comments.where({
      conversationId
    });

    // debug("comments", comments);
    expect(comments).to.be.an("array");
    expect(comments.length).to.equal(1);
  });
  it("normal conversation extra reply", async function() {
    const commentObj = {
      senderId: "testUserId",
      textData: "test",
      documentType: "conversation",
      documentId: conversationId
    };
    const result = await processComment(commentObj);
    debug("normal conversation reply :%o", result);
    expect(result).to.be.an("object");
    expect(result.conversationId).to.equal(conversationId);

    const comment = await Comments.first({ _id: result.commentsId });
    expect(comment).to.be.an("object");

    expect(comment.value).to.eql(commentObj.textData);
    expect(comment.created.by).to.eql(commentObj.senderId);
    const comments = await Comments.where({
      conversationId
    });

    // debug("comments", comments);
    expect(comments.length).to.equal(2);
  });

  it("normal conversation reply, correct userId", async function() {
    const result = await processComment({
      senderId: "4qvPsqzARLkf4wFDT",
      textData: "test",
      conversationId,
      documentType: "conversation",
      documentId: conversationId
    });
    debug("conversation reply, correct userId :%o", result);
    const comment = await Comments.first({ _id: result.commentsId });
    expect(comment).to.be.an("object");
    const comments = await Comments.where({
      conversationId
    });

    // debug("comments", comments);
    expect(comments.length).to.equal(3);
  });

  it("price request comment", async function() {
    const result = await processComment({
      senderId: "testUserId",
      textData: "test message 1",
      documentType: "pricerequest",
      documentId: priceRequestData._id,
      meta1: priceRequestData.bidders[1].accountId,
      meta2: priceRequestData.bidders[1].userIds[1]
    });
    debug("normal conversation reply :%o", result);
    expect(result).to.be.an("object");
    const comments = Comments.where({
      conversationId: result.conversationId
    });

    // debug("comments", comments);
    expect(comments).to.be.an("array");
    expect(comments.length).to.equal(1);
    expect(comments[0].value).to.equal("test message 1");
  });

  it("second price request comment", async function() {
    // insert pr obj with limited fields for testing
    const result = await processComment({
      senderId: "testUserId",
      textData: "test message 2",
      documentType: "pricerequest",
      documentId: priceRequestData._id,
      meta1: priceRequestData.bidders[1].accountId,
      meta2: priceRequestData.bidders[1].userIds[1]
    });
    debug("normal conversation reply :%o", result);
    expect(result).to.be.an("object");
    const comments = await Comments.where({
      conversationId: result.conversationId
    });
    expect(comments).to.be.an("array");
    expect(comments.length).to.equal(2);
    expect(comments[0].value).to.equal("test message 1");
    expect(comments[1].value).to.equal("test message 2");
  });
});
