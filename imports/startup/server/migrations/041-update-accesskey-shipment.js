/* eslint-disable no-undef */

import { Shipment } from "/imports/api/shipments/Shipment";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

Migrations.add({
  version: 41,
  name:
    "reset access key for price requests in status requested on shipment obj",
  up: () => {
    // delete existing keys
    Shipment._collection.direct.update(
      { access: { $exists: true } },
      { $unset: { access: null } },
      { multi: true, bypassCollection2: true }
    );

    const prs = PriceRequest.find(
      { status: "requested" },
      { fields: { "items.shipmentId": 1, "bidders.accountId": 1 } }
    );

    const result = [];

    prs.forEach(pr => {
      //    console.log(pr);
      const shipmentIds = (pr.items || []).map(item => item.shipmentId);
      const accountIds = (pr.bidders || []).map(bidder => bidder.accountId);
      result.push({ shipmentIds, accountIds, id: pr._id });
    });

    result.forEach(el => {
      const access = el.accountIds.map(accountId => {
        return { accountId, action: "priceRequest", id: el.id };
      });
      console.log(
        { _id: { $in: el.shipmentIds } },
        JSON.stringify({ $set: { access } })
      );

      // set correct access rules
      Shipment._collection.direct.update(
        { _id: { $in: el.shipmentIds } },
        { $set: { access } },
        { multi: true, bypassCollection2: true }
      );
    });
  }
});
