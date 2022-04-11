import React from "react";
import moment from "moment";
import faker from "faker";
import PageHolder from "../../../components/utilities/PageHolder";
import { PriceRequestDataSingle } from "./Data-single.jsx";

import { nestedItemsData } from "/imports/client/views/shipment/sections/items/overview-simple/storyData";
import { buildNestedItems } from "/imports/api/items/items-helper";

export default {
  title: "PriceRequest/Segments/data-single"
};

const dummyProps = {
  priceRequest: {
    _id: "test",
    items: [
      {
        shipmentId: "LfPjec3hQBevaG3oT",
        params: {
          from: {
            addressId: "aeQNzE5c8BqTZv9pw",
            countryCode: "BE",
            zipCode: "9320"
          },
          to: {
            addressId: "WJNLceXYjFBdYL4YQ",
            countryCode: "ES",
            zipCode: "28500"
          },
          goods: {
            quantity: {
              pal: 10
            }
          },
          equipments: [],
          serviceLevel: "LTL"
        }
      }
    ],
    requirements: {
      customsClearance: true,
      freeDays: {
        condition: faker.lorem.sentence(),
        demurrage: 10,
        detention: 5
      }
    }
  },
  shipment: {
    id: "testId",
    number: "XYZDF23",
    references: {
      number: "shipperRef",
      booking: "bookingRef"
    },
    pickup: {
      date: moment("2020-07-22T22:00:00.000+0000").toDate(),
      location: {
        countryCode: "BE",
        zipCode: "1000",
        addressId: "someId",
        name: "some name",
        address: {
          street: "some street",
          number: "10",
          city: "some city"
        }
      }
    },
    delivery: {
      date: moment()
        .add(3, "days")
        .toDate(),
      location: {
        countryCode: "US",
        name: "New York Pt.",
        locode: {
          id: "USNYK",
          code: "NYK",
          function: "123"
        }
      }
    }
  },
  onSaveAction: () => {},
  accessControl: () => false,
  refreshData: () => {}
};

// legacy shipment
export const basic = () => {
  const props = { ...dummyProps };
  props.shipment = {
    ...props.shipment,
    items: [
      {
        id: "someId",
        temperature: {
          condition: "-/- 18c"
        },
        quantity: 10,
        quantity_unit: "",
        quantity_unit_description: "Truck food grade",
        weight_gross: 22000,
        weight_net: 22000,
        weight_unit: "kg",
        material: {
          description: "Butter lactic min.82% butterfat, max. 16% moisture",
          id: "Butter 82% Lactic"
        }
      }
    ]
  };
  return (
    <PageHolder main="PriceRequest" style={{ overflow: "scroll" }}>
      <PriceRequestDataSingle {...props} />
    </PageHolder>
  );
};

// new nested structure
export const basicNested = () => {
  const props = { ...dummyProps };
  props.nestedItems = buildNestedItems(nestedItemsData);
  return (
    <PageHolder main="PriceRequest" style={{ overflow: "scroll" }}>
      <PriceRequestDataSingle {...props} />
    </PageHolder>
  );
};
