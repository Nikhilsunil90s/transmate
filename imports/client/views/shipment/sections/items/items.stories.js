import React from "react";
import faker from "faker";

import PageHolder from "../../../../components/utilities/PageHolder";

export default {
  title: "Shipment/Segments/items"
};

const dummyProps = {
  shipment: {
    _id: "test"
  },
  onSaveAction: () => {}
};

export const basic = () => {
  const items = [
    {
      _id: "parentId",
      shipmentId: "test",
      quantity: 1,
      quantity_unit: "Semi-trailer",
      type: "TU",
      itemType: "truck",
      references: {
        truckId: "truck id",
        trailerId: "trailer id",
        seal: "seal id"
      },
      DG: true,
      temperature: {
        condition: "4-8 degrees C",
        range: {
          from: 4,
          to: 8,
          unit: "C"
        }
      },
      weight_net: 15000,
      weight_tare: 2000,
      weight_gross: 17000,
      weight_unit: "kg",
      calcSettings: {
        costRelevant: false,
        itemize: true,
        keys: {}
      }
    },
    {
      _id: "childId1",
      shipmentId: "test",
      parentItemId: "parentId",
      quantity: 20,
      quantity_unit: "EURO pallet",

      // fields from quantity_unit
      type: "HU",
      itemType: "pal",

      // general
      number: `${faker.random.number()}`,
      description: faker.lorem.words(),
      commodity: faker.lorem.words(),

      // references:
      references: {
        order: `${faker.random.number()}`,
        delivery: `${faker.random.number()}`,
        document: `${faker.random.number()}`
      },

      material: {
        id: `${faker.random.number()}`,
        description: faker.lorem.words(),

        // conditions
        DG: true,
        DGClassType: faker.lorem.words(),
        temperature: {
          condition: "4-8 degrees C",
          range: {
            from: 4,
            to: 8,
            unit: "C"
          }
        },

        // weight
        weight_net: 12500,
        weight_tare: 2500,
        weight_gross: 15000,
        weight_unit: "kg",

        // dimensions
        dimensions: {
          length: 33,
          width: 4,
          height: 2.5,
          uom: "m"
        }
      },

      // cost relevance
      taxable: [
        { type: "pal", quantity: 20 },
        { type: "kg", quantity: 15000 }
      ],

      calcSettings: {
        costRelevant: true,
        itemize: false,
        keys: { pal: 1, kg: 750, lm: 0.8 }
      }
    }
  ];
  console.log(items);
  return <PageHolder main="Shipment">Items</PageHolder>;
};

export const empty = () => {
  dummyProps.shipment.links = [];
  return <PageHolder main="Shipment">... stuff here</PageHolder>;
};
