/* eslint-disable func-names */
import faker from "faker";

import { Shipment } from "/imports/api/shipments/Shipment.js";
import { Stage } from "/imports/api/stages/Stage.js";
import { Address } from "/imports/api/addresses/Address";
import { ShipmentItem } from "/imports/api/items/ShipmentItem";
import { GenerateAddressData } from "/imports/api/addresses/testing/server/generateAddressData";
import { getShipmentItemDoc } from "/imports/api/items/testing/shipmentItemTestData";
import { resolvers as shipmentResolvers } from "/imports/api/shipments/apollo/resolvers";

export const insertAddress = function(accountId) {
  return Address._collection.insert(GenerateAddressData.dbData(accountId));
};

export const prepareShipmentWithStage = async function(context, overrides) {
  const { accountId } = context;

  // generate addresses in addresBook..
  const [fromId, toId] = await Promise.all([
    insertAddress(accountId),
    insertAddress(accountId)
  ]);

  const args = {
    pickup: {
      location: {
        type: "address",
        id: fromId
      },
      date: new Date()
    },
    delivery: {
      location: {
        type: "address",
        id: toId
      },
      date: faker.date.future()
    }
  };

  const shipmentId = await shipmentResolvers.Mutation.createShipment(
    null,
    { input: args },
    context
  );
  if (overrides) {
    await Shipment._collection.update({ _id: shipmentId }, { $set: overrides });
  }

  const [shipment, stage, item] = await Promise.all([
    Shipment.first({ _id: shipmentId }),
    Stage.first({ shipmentId }),
    ShipmentItem.create_async(getShipmentItemDoc({ shipmentId }))
  ]);

  return { shipment, stage, item };
};
