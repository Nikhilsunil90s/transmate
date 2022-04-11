import React from "react";
import { PriceRequestsOverview } from "./PriceRequestOverview.jsx";

export default {
  title: "PriceRequest/Overview"
};

const dummyProps = {
  serverTimeDifference: 0,
  isRequestsLoading: false,
  priceRequests: [
    {
      _id: "fvxwvxmZbZFSnYpm7",
      type: "spot",
      status: "requested",
      requestedBy: "Dsqp3CRYjFpF8rQbh",
      dueDate: "2020-06-19T13:55:00.000Z",
      customerId: "S65957",
      created: {
        at: "2020-06-10T14:18:41.948Z"
      },
      title: "Price Request 0610-PM7",
      bidders: [
        {
          accountId: "C11051",
          name: "Carrier Beta",
          userIds: ["vurn7xga9vXgSvjPr"],
          notified: "2020-06-12T16:05:23.935Z",
          firstSeen: "2020-06-12T16:05:42.325Z",
          lastSeen: "2020-06-17T11:47:21.041Z",
          viewed: true,
          bidOpened: "2020-06-16T14:40:35.031Z",
          priceListId: "THLc69jEGwEknNuJz",
          simpleBids: [
            {
              date: "2020-06-17T09:29:46.696Z",
              shipmentId: "xztZTpnGLNtBdJrQz",
              chargeLines: [
                {
                  id: "kvrTMnuzXcpMvACTg",
                  name: "Base rate",
                  costId: "o6fLThAWhaWW3uDaj",
                  amount: {
                    value: 109,
                    unit: "EUR"
                  }
                }
              ]
            }
          ],
          bid: true,
          notes: "some notes"
        }
      ],
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners: "Carrier Beta",
      ref: "0610-PM7",
      requester: true,
      bids: 1,
      wons: 0,
      biddersInRequest: 1,
      requestedByName: "philip poppe"
    },
    {
      _id: "Dwf2LAPcADciHHXdx",
      type: "spot",
      status: "requested",
      dueDate: "2020-06-26T22:00:00.000Z",
      requestedBy: "Dsqp3CRYjFpF8rQbh",
      customerId: "S65957",
      created: {
        at: "2020-06-02T12:32:30.838Z"
      },
      bidders: [
        {
          accountId: "C11051",
          name: "Carrier Beta",
          contacts: [
            {
              userId: "vurn7xga9vXgSvjPr",
              contactType: "general",
              mail: "info@carrierbeta.com",
              phone: "+32 2 5674345",
              linkedId: "vurn7xga9vXgSvjPr"
            }
          ],
          userIds: ["vurn7xga9vXgSvjPr"],
          notified: "2020-06-22T12:39:13.328Z"
        },
        {
          accountId: "C25419",
          name: "DBS DB Schenker",
          contacts: [],
          notified: "2020-06-23T07:12:51.180Z",
          userIds: []
        }
      ],
      title: "Price Request 0602-XD",
      numberOfItems: 3,
      customer: {
        name: "Globex"
      },
      partners: "Carrier Beta, DBS DB Schenker",
      ref: "0602-XDX",
      requester: true,
      bids: 0,
      wons: 0,
      biddersInRequest: 2,
      requestedByName: "philip poppe"
    },
    {
      _id: "9RunbdNFyzajv7s48",
      type: "spot",
      status: "draft",
      dueDate: "2020-06-03T12:00:00.000Z",
      requestedBy: "Dsqp3CRYjFpF8rQbh",
      customerId: "S65957",
      created: {
        at: "2020-06-02T12:28:32.947Z"
      },
      title: "0602-S48",
      numberOfItems: 0,
      customer: {
        name: "Globex"
      },
      partners: "",
      ref: "0602-S48",
      requester: true,
      bids: 0,
      wons: 0,
      biddersInRequest: 0,
      requestedByName: "philip poppe"
    },
    {
      _id: "DMjhJcbCRWmd3mG2r",
      type: "spot",
      status: "draft",
      dueDate: "2020-06-03T11:00:00.000Z",
      requestedBy: "Dsqp3CRYjFpF8rQbh",
      customerId: "S65957",
      created: {
        at: "2020-06-02T12:17:20.503Z"
      },
      title: "0602-G2R",
      numberOfItems: 0,
      customer: {
        name: "Globex"
      },
      partners: "",
      ref: "0602-G2R",
      requester: true,
      bids: 0,
      wons: 0,
      biddersInRequest: 0,
      requestedByName: "philip poppe"
    },
    {
      _id: "LC6dbv4vTJdb9bxNJ",
      type: "spot",
      status: "draft",
      dueDate: "2020-06-03T11:00:00.000Z",
      requestedBy: "Dsqp3CRYjFpF8rQbh",
      customerId: "S65957",
      created: {
        at: "2020-06-02T12:01:16.910Z"
      },
      title: "0602-XNJ",
      numberOfItems: 0,
      customer: {
        name: "Globex"
      },
      partners: "",
      ref: "0602-XNJ",
      requester: true,
      bids: 0,
      wons: 0,
      biddersInRequest: 0,
      requestedByName: "philip poppe"
    },
    {
      _id: "bLkoi6QJSMfJWAAwT",
      type: "spot",
      status: "requested",
      dueDate: "2020-06-16T17:00:00.000Z",
      requestedBy: "Dsqp3CRYjFpF8rQbh",
      customerId: "S65957",
      created: {
        at: "2020-04-15T17:50:03.536Z"
      },
      bidders: [
        {
          accountId: "P66384",
          notified: "2020-06-16T07:35:08.089Z",
          userIds: []
        },
        {
          accountId: "C11051",
          name: "Carrier Beta",
          firstSeen: "2020-05-06T15:33:52.441Z",
          lastSeen: "2020-06-16T14:35:28.222Z",
          viewed: true,
          notes: "test",
          simpleBids: [
            {
              date: "2020-06-16T14:33:42.933Z",
              shipmentId: "aauYoSshHJ26DA3ZW",
              chargeLines: [
                {
                  id: "kvrTMnuzXcpMvACTg",
                  name: "Base rate",
                  costId: "o6fLThAWhaWW3uDaj",
                  amount: {
                    value: 1000,
                    unit: "EUR"
                  }
                },
                {
                  id: "3vww2WBhcL7xRPWjx",
                  name: "fuel cost",
                  costId: "tKriCZxRiHQBCZ8ZB",
                  amount: {
                    value: 0,
                    unit: "EUR"
                  }
                }
              ]
            }
          ],
          bid: true,
          notified: "2020-06-16T07:35:07.927Z",
          userIds: ["vurn7xga9vXgSvjPr"],
          bidOpened: "2020-06-16T14:33:42.791Z",
          priceListId: "8mbzXL7XczbycL9QE"
        }
      ],
      title: "Price Request 0415-AWT",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners: ", Carrier Beta",
      ref: "0415-AWT",
      requester: true,
      bids: 1,
      wons: 0,
      biddersInRequest: 2,
      requestedByName: "philip poppe"
    },
    {
      _id: "xkQqQabhTJ2a5GJmk",
      type: "spot",
      status: "requested",
      dueDate: "2020-04-15T17:00:00.000Z",
      requestedBy: "Dsqp3CRYjFpF8rQbh",
      customerId: "S65957",
      created: {
        at: "2020-04-14T17:40:57.271Z"
      },
      bidders: [
        {
          accountId: "C75701",
          name: "Carrier PlayCo",
          notified: "2020-04-14T17:48:42.887Z",
          firstSeen: "2020-04-14T17:49:59.356Z",
          lastSeen: "2020-04-14T17:49:59.356Z",
          viewed: true,
          bid: true,
          priceListId: "bffpJ2TwePwjrRMHs"
        },
        {
          accountId: "C11051",
          name: "Carrier Beta",
          notified: "2020-04-14T17:48:42.100Z"
        }
      ],
      title: "0414-JMK",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners: "Carrier PlayCo, Carrier Beta",
      ref: "0414-JMK",
      requester: true,
      bids: 1,
      wons: 0,
      biddersInRequest: 2,
      requestedByName: "philip poppe"
    },
    {
      _id: "fC4meqdx9YpCmn6Pz",
      type: "spot",
      status: "draft",
      dueDate: "2020-03-18T18:00:00.000Z",
      customerId: "S65957",
      requestedBy: "Dsqp3CRYjFpF8rQbh",
      created: {
        at: "2020-03-17T18:55:07.863Z"
      },
      bidders: [
        {
          accountId: "S47529",
          notified: "2020-04-10T12:41:22.618Z"
        },
        {
          accountId: "C69205",
          name: "Joep Transport",
          firstSeen: "2020-03-31T14:31:41.817Z",
          lastSeen: "2020-03-31T15:18:26.479Z",
          viewed: true,
          bid: true,
          priceListId: "qBA5piSNSotYxpvfT",
          notes: "test",
          notified: "2020-04-10T12:41:21.967Z"
        }
      ],
      title: "0317-6PZ",
      numberOfItems: 7,
      customer: {
        name: "Globex"
      },
      partners: ", Joep Transport",
      ref: "0317-6PZ",
      requester: true,
      bids: 1,
      wons: 0,
      biddersInRequest: 2,
      requestedByName: "philip poppe"
    },
    {
      _id: "cwf3PJAKqPZHjNbzJ",
      type: "spot",
      status: "draft",
      dueDate: "2020-03-18T18:00:00.000Z",
      customerId: "S65957",
      requestedBy: "Dsqp3CRYjFpF8rQbh",
      created: {
        at: "2020-03-17T18:49:34.917Z"
      },
      title: "0317-BZJ",
      numberOfItems: 0,
      customer: {
        name: "Globex"
      },
      partners: "",
      ref: "0317-BZJ",
      requester: true,
      bids: 0,
      wons: 0,
      biddersInRequest: 0,
      requestedByName: "philip poppe"
    },
    {
      _id: "k3JHpyFBaJ6PLQiKu",
      type: "spot",
      status: "draft",
      dueDate: "2019-12-19T09:00:00.000Z",
      customerId: "S65957",
      requestedBy: "jsBor6o3uRBTFoRQY",
      created: {
        at: "2019-12-18T09:49:38.601Z"
      },
      bidders: [
        {
          accountId: "P66384",
          name: "Broker PlayCo"
        }
      ],
      title: "1218-IKU",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners: "Broker PlayCo",
      ref: "1218-IKU",
      requester: true,
      bids: 0,
      wons: 0,
      biddersInRequest: 1
    },
    {
      _id: "EAenna58ix4FpxhkH",
      type: "spot",
      status: "requested",
      dueDate: "2019-11-20T13:00:00.000Z",
      customerId: "S65957",
      requestedBy: "jsBor6o3uRBTFoRQY",
      created: {
        at: "2019-11-19T13:21:42.391Z"
      },
      bidders: [
        {
          accountId: "C75701",
          name: "Carrier PlayCo",
          firstSeen: "2019-11-19T13:26:57.284Z",
          lastSeen: "2020-04-07T11:21:54.187Z",
          viewed: true,
          bid: true,
          priceListId: "h4NiZxFmZ7D83x9FT"
        },
        {
          accountId: "C11051",
          name: "Carrier Beta",
          firstSeen: "2019-11-19T13:26:57.284Z",
          lastSeen: "2019-11-19T13:26:57.284Z",
          viewed: true,
          bid: true,
          priceListId: "h4NiZxFmZ7D83x9XX"
        }
      ],
      title: "1119-HKH",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners: "Carrier PlayCo, Carrier Beta",
      ref: "1119-HKH",
      requester: true,
      bids: 2,
      wons: 0,
      biddersInRequest: 2
    },
    {
      _id: "zhB2LZDY75nhQJQis",
      type: "spot",
      status: "draft",
      dueDate: "2019-11-20T13:00:00.000Z",
      customerId: "S65957",
      requestedBy: "jsBor6o3uRBTFoRQY",
      created: {
        at: "2019-11-19T13:20:10.475Z"
      },
      title: "1119-QIS",
      numberOfItems: 11,
      customer: {
        name: "Globex"
      },
      partners: "",
      ref: "1119-QIS",
      requester: true,
      bids: 0,
      wons: 0,
      biddersInRequest: 0
    },
    {
      _id: "bukmz3TggXqCP68HW",
      type: "spot",
      status: "draft",
      dueDate: "2019-11-22T18:50:00.000Z",
      customerId: "S65957",
      requestedBy: "jsBor6o3uRBTFoRQY",
      created: {
        at: "2019-11-19T13:15:56.906Z"
      },
      title: "1119-8HW",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners: "",
      ref: "1119-8HW",
      requester: true,
      bids: 0,
      wons: 0,
      biddersInRequest: 0
    },
    {
      _id: "sALSKXw2eJnAj9wCh",
      type: "spot",
      status: "requested",
      dueDate: "2019-11-08T15:00:00.000Z",
      customerId: "S65957",
      requestedBy: "Dsqp3CRYjFpF8rQbh",
      created: {
        at: "2019-11-07T15:34:17.069Z"
      },
      bidders: [
        {
          accountId: "C75701",
          name: "Carrier PlayCo",
          firstSeen: "2019-11-07T15:35:36.161Z",
          lastSeen: "2019-11-08T14:28:23.351Z",
          viewed: true,
          bid: true,
          priceListId: "EJdRuujZqaqkBL67H"
        },
        {
          accountId: "C75702",
          name: "Carrier PlayCo 2",
          firstSeen: "2019-11-07T15:35:36.161Z",
          lastSeen: "2019-11-07T15:35:40.482Z",
          viewed: true,
          bid: true,
          priceListId: "EJdRuujZqaqkBL688"
        },
        {
          accountId: "C75703",
          name: "Carrier PlayCo 3",
          firstSeen: "2019-11-07T15:35:36.161Z",
          lastSeen: "2019-11-07T15:35:40.482Z",
          viewed: true,
          bid: true,
          priceListId: "EJdRuujZqaqkBL688"
        },
        {
          accountId: "C75704",
          name: "Carrier PlayCo 4",
          firstSeen: "2019-11-07T15:35:36.161Z",
          lastSeen: "2019-11-07T15:35:40.482Z",
          viewed: true,
          bid: true,
          priceListId: "EJdRuujZqaqkBL688"
        },
        {
          accountId: "C75705",
          name: "Carrier PlayCo 5",
          firstSeen: "2019-11-07T15:35:36.161Z",
          lastSeen: "2019-11-07T15:35:40.482Z",
          viewed: true,
          bid: true,
          priceListId: "EJdRuujZqaqkBL688"
        },
        {
          accountId: "C75706",
          name: "Carrier PlayCo 6",
          firstSeen: "2019-11-07T15:35:36.161Z",
          lastSeen: "2019-11-07T15:35:40.482Z",
          viewed: true,
          bid: true,
          priceListId: "EJdRuujZqaqkBL688"
        }
      ],
      title: "1107-WCH",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners:
        "Carrier PlayCo, Carrier PlayCo 2, Carrier PlayCo 3, Carrier PlayCo 4, Carrier PlayCo 5, Carrier PlayCo 6",
      ref: "1107-WCH",
      requester: true,
      bids: 6,
      wons: 0,
      biddersInRequest: 6,
      requestedByName: "philip poppe"
    },
    {
      _id: "p8vfLkBRXehtJ8KbP",
      type: "spot",
      status: "requested",
      dueDate: "2019-11-07T08:00:00.000Z",
      customerId: "S65957",
      requestedBy: "Dsqp3CRYjFpF8rQbh",
      created: {
        at: "2019-11-06T09:00:20.326Z"
      },
      bidders: [
        {
          accountId: "C11051",
          name: "Carrier Beta"
        },
        {
          accountId: "C75701",
          name: "Carrier PlayCo",
          firstSeen: "2019-11-06T10:45:29.923Z",
          lastSeen: "2019-11-08T14:34:33.155Z",
          viewed: true,
          bid: true,
          priceListId: "4iPmrSPGsJKw8Xb7n"
        },
        {
          accountId: "C62930",
          name: "tnt express"
        }
      ],
      title: "1106-KBP",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners: "Carrier Beta, Carrier PlayCo, tnt express",
      ref: "1106-KBP",
      requester: true,
      bids: 1,
      wons: 0,
      biddersInRequest: 3,
      requestedByName: "philip poppe"
    }
  ],
  currentViewKey: "allRequests",
  setView: console.log,
  setDefaultView: console.log("default view")
};
export const basic = () => {
  const data = { ...dummyProps };
  return (
    <div className="app">
      <main className="PriceRequests">
        <div>
          <PriceRequestsOverview {...data} />
        </div>
      </main>
    </div>
  );
};
