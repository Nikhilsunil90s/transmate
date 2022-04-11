export const changesTestData = [
  {
    collection: "shipments",
    docId: "2jG2mZFcaFzqaThcr",
    changes: {
      added: {
        references: {
          number: "TN 2021|01|008"
        }
      },
      deleted: {
        updated: {}
      },
      updated: {
        updated: {
          by: "dH842ByGTEvhLmRxY",
          at: new Date()
        }
      }
    },
    userId: "dH842ByGTEvhLmRxY",
    modifier: '{"$set":{"references":{"number":"TN 2021|01|008"}}}',
    created: {
      by: "dH842ByGTEvhLmRxY",
      at: new Date()
    }
  },
  {
    collection: "shipments",
    docId: "2jG2mZFcaFzqaThcr",
    changes: {
      added: {},
      deleted: {
        updated: {}
      },
      updated: {
        delivery: {
          date: new Date("2021-01-24T23:00:11.442+0000")
        },
        updated: {
          by: "dH842ByGTEvhLmRxY",
          at: new Date("2021-01-20T08:42:48.110+0000")
        }
      }
    },
    userId: "dH842ByGTEvhLmRxY",
    modifier: '{"$set":{"delivery.date":"2021-01-24T23:00:11.442Z"}}',
    created: {
      by: "dH842ByGTEvhLmRxY",
      at: new Date("2021-01-20T08:42:48.125+0000")
    }
  },
  {
    collection: "shipments",
    docId: "2jG2mZFcaFzqaThcr",
    changes: {
      added: {},
      deleted: {
        delivery: {}
      },
      updated: {}
    },
    userId: "dH842ByGTEvhLmRxY",
    modifier: '{"$set":{"delivery.date":"2021-01-24T22:00:11.442Z"}}',
    created: {
      by: "dH842ByGTEvhLmRxY",
      at: new Date("2021-01-20T08:45:48.125+0000")
    }
  },
  {
    collection: "shipment.items",
    docId: "dJYnbRjRQp7uPrFrK",
    changes: {
      added: {},
      deleted: {
        updated: {}
      },
      updated: {
        quantity: {
          amount: 2
        },
        weight_gross: 2150,
        updated: {
          at: new Date()
        }
      }
    },
    userId: "dH842ByGTEvhLmRxY",
    modifier:
      '{"$set":{"shipmentId":"d7KC6Z8rpoSah3Xoi","level":0,"quantity":{"amount":2,"code":"PAL","description":"Pallet"},"type":"HU","weight_gross":2150,"weight_unit":"kg","calcSettings":{"costRelevant":true,"itemize":true}}}',
    created: {
      by: "dH842ByGTEvhLmRxY",
      at: new Date()
    }
  },
  {
    collection: "stages",
    docId: "mTQmzoCfAiLbGFzo3",
    changes: {
      added: {},
      deleted: {},
      updated: {
        updated: {
          at: new Date()
        }
      }
    },
    userId: "dH842ByGTEvhLmRxY",
    modifier:
      '{"$set":{"dates.delivery.arrival.planned":"2021-01-24T23:00:00.000Z"}}',
    created: {
      by: "dH842ByGTEvhLmRxY",
      at: new Date()
    }
  }
];
