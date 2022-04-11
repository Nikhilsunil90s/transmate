// import { expect } from "chai";
// import faker from "faker";

// import { Address } from "../../../addresses/Address";

// import { Shipment } from "../../Shipment";
// import { Stage } from "../../../stages/Stage";
import { resolvers } from "../../apollo/resolvers";

// import { GenerateAddressData } from "/imports/api/addresses/testing/server/generateAddressData";

// import { SHIPMENT_KEYS, STAGE_KEYS } from "./_requiredKeysTest";

export const testCreateException = (mockArgs, context) => {
  return resolvers.Mutation.createShipment(null, mockArgs, context);
};

// export const testCreate = async (mockArgs, context) => {
//   const { accountId } = context;
//   const shipmentId = await resolvers.Mutation.createShipment(
//     null,
//     mockArgs,
//     context
//   );
//   expect(shipmentId).to.be.a("string");

//   // check if address is properly set:
//   // annotated date should be properly copied over
//   const shipment = await Shipment.first(shipmentId);
//   expect(shipment.shipperId).to.equal(accountId);
//   expect(shipment.accountId).to.equal(accountId);

//   const [from, to] = Promise.all([Address.first(fromId), Address.first(toId)]);
//   expect(shipment.pickup.location.name).to.equal(from.accounts[0].name);
//   expect(shipment.delivery.location.name).to.equal(to.accounts[0].name);

//   expect(shipment).to.include.keys(SHIPMENT_KEYS);

//   // have the stages been built?
//   const stages = await Stage.where({ shipmentId });
//   expect(stages).to.have.lengthOf(1);
//   expect(stages[0]).to.include.keys(STAGE_KEYS);
// };

// export async function prepareDataCreate(shipperId) {
//   // generate addresses in addresBook..
//   const fromId = await Address._collection.insert(
//     GenerateAddressData.dbData(shipperId)
//   );

//   const toId = await Address._collection.insert(
//     GenerateAddressData.dbData(shipperId)
//   );

//   return {
//     pickup: {
//       location: {
//         type: "address",
//         id: fromId
//       },
//       date: new Date()
//     },
//     delivery: {
//       location: {
//         type: "address",
//         id: toId
//       },
//       date: faker.date.future()
//     },
//     fromId,
//     toId
//   };
// }
