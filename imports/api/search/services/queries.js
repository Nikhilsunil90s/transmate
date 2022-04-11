import get from "lodash.get";
import { Tender } from "/imports/api/tenders/Tender";
import { Shipment } from "/imports/api/shipments/Shipment.js";
import { AllAccounts } from "../../allAccounts/AllAccounts";
import { PriceList } from "/imports/api/pricelists/PriceList.js";
import { CheckFeatureSecurity } from "/imports/utils/security/checkUserPermissionsForFeatures";
import { PriceRequest } from "/imports/api/priceRequest/PriceRequest";
import { addressOverview } from "/imports/api/addresses/services/query.addressOverview";

const debug = require("debug")("search:query");

const searchShipments = async (query, { accountId, userId }) => {
  const check = new CheckFeatureSecurity({}, { accountId, userId });
  await check.getDoc();
  check.can({ feature: "shipment" });
  if (!check.check()) {
    debug("user is not allowed to see shipment!");
    return [];
  }
  debug("searchShipments %o", { query, accountId });
  const shipments = await Shipment.where(
    {
      $text: {
        // $search:
        // _id: "text",
        // "delivery.location.name": "text",
        // number: "text",
        // "pickup.location.name": "text",
        // "references.number": "text"
        $search: query
      },
      accountId,
      deleted: false
    },
    {
      // sort: 'created.at': -1
      score: { $meta: "textScore" },
      limit: 5,
      fields: {
        _id: 1,
        number: 1,
        references: 1,
        "delivery.location.name": 1,
        carrierIds: 1,
        shipperId: 1
      }
    }
  );
  return shipments.map((shipment, i) => ({
    type: "shipment",
    key: `shipment-${i}`,
    id: shipment._id,
    title: `${shipment.number} ${get(shipment, [
      "delivery",
      "location",
      "name"
    ]) ||
      get(shipment, ["references", "number"]) ||
      ""}`,
    description: `Shipper: ${shipment.shipperId}`
  }));
};

const searchAddress = async (query, { accountId, userId }) => {
  const check = new CheckFeatureSecurity({}, { accountId, userId });
  await check.getDoc();
  check.can({ feature: "location" });
  if (!check.check()) {
    debug("user is not allowed to see locations!");
    return [];
  }
  debug("searchAddress %o", { query, accountId });
  const srv = addressOverview({
    accountId,
    userId
  }).buildQuery({
    viewKey: "search",
    nameFilter: query
  });
  const list = await srv.get();
  return list.map((address, i) => ({
    type: "address",
    key: `address-${i}`,
    id: address._id,
    title: address.addressName,
    description: address.addressFormated
  }));
};

const searchPartners = async (query, { accountId }) => {
  debug("searchPartners %o", { query, accountId });
  const partners = await AllAccounts.where(
    {
      $and: [
        {
          "partners.accountId": accountId,
          "partners.status": {
            $in: ["active", "requested", "rejected"]
          },
          deleted: { $ne: true }
        },
        {
          $or: [
            { name: { $regex: new RegExp(query), $options: "i" } },
            { _id: query },
            { "accounts.name": { $regex: new RegExp(query), $options: "i" } },
            { "accounts.coding.ediId": query },
            {
              "accounts.profile.contacts.mail": {
                $regex: new RegExp(query),
                $options: "i"
              }
            }
          ]
        }

        // deleted flag is not yet set on account
        // ,
        // { deleted: false }
      ]
    },
    {
      limit: 5,
      fields: { name: 1, accounts: { $elemMatch: { accountId } } }
    }
  );

  return partners.map((partner, i) => ({
    type: "partner",
    key: `partner-${i}`,
    id: partner.id,
    title: partner.getName(),
    description: partner.id
  }));
};

const searchPriceLists = async (query, { accountId }) => {
  debug("searchPriceLists %o", { query, accountId });
  const priceLists = await PriceList.where(
    {
      $and: [
        {
          $or: [
            {
              carrierId: accountId
            },
            {
              customerId: accountId
            }
          ]
        },
        {
          $text: {
            // title and carrierName
            $search: query
          }
        },
        { deleted: false }
      ]
    },
    {
      limit: 5,
      fields: { title: 1, carrierName: 1 },
      score: { $meta: "textScore" }
    }
  );

  return priceLists.map((priceList, i) => ({
    type: "priceList",
    key: `priceList-${i}`,
    id: priceList._id,
    title: priceList.title,
    description: priceList.carrierName
  }));
};

const searchPriceRequests = async (query, { accountId }) => {
  debug("searchPriceRequests %o", { query, accountId });
  const priceRequests = await PriceRequest.where(
    {
      $and: [
        {
          $or: [
            {
              customerId: accountId
            },
            {
              creatorId: accountId
            },
            {
              "bidders.accountId": accountId
            }
          ]
        },
        {
          $text: {
            $search: query
          }
        },
        { deleted: false },
        { status: { $ne: "deleted" } }
      ]
    },
    {
      limit: 3,
      sort: { "created.at": -1 },
      fields: { title: 1, customerId: 1 }
    }
  );

  return priceRequests.map((priceRequest, i) => ({
    type: "priceRequestEdit",
    key: `pr-${i}`,
    id: priceRequest._id,
    title: priceRequest.title,
    description: priceRequest.customerId
  }));
};

const searchTenders = async (query, { accountId }) => {
  debug("searchTenders %o", { query, accountId });
  const tenders = await Tender.where(
    {
      $and: [
        {
          $or: [
            {
              accountId
            }

            // ,{
            //   "bidders.accountId": accountId
            // }
          ]
        },
        {
          title: { $regex: new RegExp(query), $options: "i" }
        },
        { deleted: false },
        { status: { $ne: "deleted" } }
      ]
    },
    {
      limit: 3,
      sort: { "created.at": -1 },
      fields: { title: 1, accountId: 1 }
    }
  );

  return tenders.map((el, i) => ({
    type: "tender",
    key: `tender-${i}`,
    id: el._id,
    title: el.title,
    description: el.accountId
  }));
};

export const performSearch = ({ query }, { accountId, userId }) => {
  if (!accountId) {
    throw new Error("no accountId set");
  }
  if (!userId) {
    throw new Error("no userId set");
  }

  debug("do a parrallel search to speed up");

  // return a promise as meteor likes those...
  return Promise.all([
    searchShipments(query, { accountId, userId }).catch(e => e),
    searchAddress(query, { accountId, userId }).catch(e => e),
    searchPartners(query, { accountId, userId }).catch(e => e),
    searchPriceRequests(query, { accountId, userId }).catch(e => e),
    searchPriceLists(query, { accountId, userId }).catch(e => e),
    searchTenders(query, { accountId, userId }).catch(e => e)
  ])
    .then(
      ([
        shipments,
        addresses,
        partners,
        priceRequests,
        priceLists,
        tenders
      ]) => {
        debug("results search: %o ", {
          shipments,
          addresses,
          partners,
          priceRequests,
          priceLists,
          tenders
        });
        return {
          shipments: {
            i18nKey: "tab.shipments",
            results: shipments || []
          },
          addresses: {
            i18nKey: "tab.addresses",
            results: addresses || []
          },
          partnerships: {
            i18nKey: "tab.partners",
            results: partners || []
          },
          priceRequest: {
            i18nKey: "tab.priceRequests",
            results: priceRequests || []
          },
          priceList: {
            i18nKey: "tab.priceLists",
            results: priceLists || []
          },
          tender: {
            i18nKey: "tab.tenders",
            results: tenders || []
          }
        };
      }
    )
    .catch(error => new Error(error));
};
