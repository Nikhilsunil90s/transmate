import React from "react";

import PriceRequestsTable from "./PriceRequestsTable";

export default {
  title: "PriceRequest/Overview"
};

const dummyProps = {
  serverTimeDifference: 650,
  priceRequests: [
    {
      _id: "p8vfLkBRXehtJ8KbP",
      ref: "0615-BBP",
      type: "spot",
      requestedByName: "jan carpentier",
      status: "archived",
      dueDate: "2019-11-07T08:00:00.000Z",
      customerId: "S65957",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners: "Carrier Beta, Carrier PlayCo, tnt express",
      requester: true,

      bids: 5,
      wons: 1,
      biddersInRequest: 10
    },
    {
      _id: "sALSKXw2eJnAj9wCh",
      type: "spot",
      status: "requested",
      dueDate: "2019-11-08T15:00:00.000Z",
      customerId: "S65957",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners:
        "Carrier PlayCo, Carrier PlayCo 2, Carrier PlayCo 3, Carrier PlayCo 4, Carrier PlayCo 5, Carrier PlayCo 6",
      requester: false,

      bid: true,
      won: new Date("2020-05-19T12:34:09.388Z")
    },
    {
      _id: "bukmz3TggXqCP68HW",
      type: "spot",
      status: "draft",
      dueDate: "2019-11-20T13:00:00.000Z",
      customerId: "S65957",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners: ""
    },
    {
      _id: "zhB2LZDY75nhQJQis",
      type: "spot",
      status: "draft",
      dueDate: "2019-11-20T13:00:00.000Z",
      customerId: "S65957",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners: ""
    },
    {
      _id: "EAenna58ix4FpxhkH",
      type: "spot",
      status: "requested",
      dueDate: "2019-11-20T13:00:00.000Z",
      customerId: "S65957",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners: "Carrier PlayCo, Carrier Beta"
    },
    {
      _id: "k3JHpyFBaJ6PLQiKu",
      type: "spot",
      status: "draft",
      dueDate: "2019-12-19T09:00:00.000Z",
      customerId: "S65957",
      numberOfItems: 1,
      customer: {
        name: "Globex"
      },
      partners: "Broker PlayCo"
    },
    {
      _id: "cwf3PJAKqPZHjNbzJ",
      type: "spot",
      status: "draft",
      dueDate: "2020-03-18T18:00:00.000Z",
      customerId: "S65957",
      numberOfItems: 0,
      customer: {
        name: "Globex"
      },
      partners: ""
    },
    {
      _id: "fC4meqdx9YpCmn6Pz",
      type: "spot",
      status: "requested",
      dueDate: "2020-03-18T18:00:00.000Z",
      customerId: "S65957",
      numberOfItems: 7,
      customer: {
        name: "Globex"
      },
      partners: "Joep Transport"
    }
  ],
  isLoading: false
};

export const simple = () => {
  return (
    <div className="app">
      <PriceRequestsTable {...dummyProps} />
    </div>
  );
};
