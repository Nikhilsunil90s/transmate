// import { expect } from "chai";
// import get from "lodash.get";
import { ShipmentItem } from "../../../items/ShipmentItem";
import { Shipment } from "../../Shipment";
import { Stage } from "../../../stages/Stage";

// import { resolvers } from "../../apollo/resolvers";
// import { SHIPMENT_KEYS, STAGE_KEYS } from "./_requiredKeysTest";

import {
  shipmentDoc,
  stageDoc,
  nestedItemDocs
} from "../data/shipmentRoadData";

const debug = require("debug")("shipment:copy:test:function");

export const prepareDataCopy = async userId => {
  const actions = [];

  // shipment must exist before we do the rest of the actions (should be revised if we would like to do batch imports!);
  await Shipment.create_async(shipmentDoc);
  actions.push(
    Stage.create_async({
      ...stageDoc,
      created: { by: userId, at: new Date() }
    })
  );

  nestedItemDocs.forEach(nestedItemDoc =>
    actions.push(ShipmentItem.create_async(nestedItemDoc))
  );
  debug("wait for all to finish %o", actions.length);
  await Promise.all(actions);
  return shipmentDoc._id;
};
