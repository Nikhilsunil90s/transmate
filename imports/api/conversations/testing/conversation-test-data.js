export const conversationData = {
  subject: "base conversation test",
  participants: [
    "Dsqp3CRYjFpF8rQbh",
    "4qvPsqzARLkf4wFDT",
    "CQ4zAnLbQkssP9Pwz",
    "d8EYFJzvXSjvh6Jws"
  ],
  documentType: "tender",
  documentId: "9ws6C86qoLP3eEzwk",
  comment: "this is the first message",
  created: { by: "Dsqp3CRYjFpF8rQbh", at: new Date() }
};

export const commentData = {
  value: "test message",
  conversationId: "H8fgqGtte2vsv2nGZ"
};

export const priceRequestData = {
  _id: "FYyFaceLqAeh5nnmo",
  requestedBy: "K3hqjR5zBoDZRccEx",
  bidders: [
    {
      accountId: "test",
      name: "test",
      notified: new Date("2020-06-23T20:29:03.862+0000"),
      userIds: ["testUserId0"]
    },
    {
      accountId: "C75701",
      name: "Carrier PlayCo",
      notified: new Date("2020-06-23T20:29:03.862+0000"),
      userIds: ["testUserId1", "testUserId2"]
    }
  ]
};

// prevent mutations
Object.freeze(conversationData);
