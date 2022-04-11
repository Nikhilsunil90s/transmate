import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";

import { Tender } from "/imports/api/tenders/Tender.js";
import { Address } from "/imports/api/addresses/Address.js";
import { priceRequestHelpers } from "/imports/api/priceRequest/services/priceRequestHelpers";
import { priceListView } from "/imports/api/pricelists/services/priceListView";
import { countShipments } from "/imports/api/shipments/services/query.getShipmentCount";

//#region helpers
async function getAddressLocations(context) {
  const { accountId } = context;
  const addressQuery = {
    "accounts.id": accountId,
    "location.lat": { $exists: true },
    "location.lng": { $exists: true }
  };
  const addresses = await Address.find(addressQuery, {
    fields: {
      "location.lat": 1,
      "location.lng": 1,
      "accounts.$": 1
    }
  }).fetch();

  // add name to list
  (addresses || []).forEach(address => {
    address.name = address.name();
  });

  return addresses;
}

async function getPriceListCount(context) {
  const res = await priceListView(context).get({
    viewKey: "default"
  });
  return res.length;
}

function getPriceRequestCount(context) {
  const query = priceRequestHelpers.viewActivePriceRequests(context);
  return PriceRequest.count(query);
}

function getInvoiceCount() {
  return 0;
}

async function getShipmentCount(context) {
  return countShipments(context).get();
}

async function getTenderCount(context) {
  const { accountId } = context;
  return Tender.count({
    $or: [
      {
        accountId,
        status: { $in: ["open", "draft"] }
      },
      {
        "bidders.accountId": accountId,
        status: {
          $in: ["open", "review"]
        }
      }
    ]
  });
}

//#endregion

export const getDashboardData = ({ accountId, userId }) => ({
  accountId,
  userId,
  async get() {
    const context = { accountId, userId };
    if (!accountId) throw new Error("accountId missing from context!");
    if (!userId) throw new Error("userId missing from context!");
    const [
      addressLocations,
      priceListCount,
      priceRequestCount,
      invoiceCount,
      shipmentCount,
      tenderCount
    ] = await Promise.all([
      getAddressLocations(context),
      getPriceListCount(context),
      getPriceRequestCount(context),
      getInvoiceCount(context),
      getShipmentCount(context),
      getTenderCount(context)
    ]);

    return {
      addressLocations,
      priceListCount,
      priceRequestCount,
      invoiceCount,
      shipmentCount,
      tenderCount
    };
  }
});
