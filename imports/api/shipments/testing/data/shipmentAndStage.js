/* eslint-disable func-names */
import faker from "faker";

import { Shipment } from "/imports/api/shipments/Shipment.js";
import { Stage } from "/imports/api/stages/Stage.js";
import { Address } from "/imports/api/addresses/Address";
import { GenerateAddressData } from "/imports/api/addresses/testing/server/generateAddressData";

import { resolvers as shipmentResolvers } from "/imports/api/shipments/apollo/resolvers";

export const prepareShipmentWithStage = async function(context, overrides) {
  const { accountId } = context;

  // generate addresses in addresBook..
  const fromId = await Address._collection.insert(
    GenerateAddressData.dbData(accountId)
  );
  const toId = await Address._collection.insert(
    GenerateAddressData.dbData(accountId)
  );

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

  const shipment = await Shipment.first({ _id: shipmentId });
  const stage = await Stage.first({ shipmentId: shipment._id });

  return { shipment, stage };
};
