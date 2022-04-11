/* eslint-disable no-use-before-define */
import React from "react";
import cloneDeep from "lodash/cloneDeep";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import ShipmentCostsSection from "./Costs.jsx";

import { simpleResult } from "/imports/api/pricelists/testing/priceLookupResult";

export default {
  title: "Shipment/Segments/costs"
};

const dummyProps = {
  security: {
    canViewCostSection: true,
    canViewCostLabel: () => true,
    canRemoveManualCost: cost => cost.source === "input",
    canApproveDecline: cost => cost.forApproval,
    canSelectCarrier: false,
    canAddBaseCost: false,
    canAddManualCost: false,
    canResetCarrier: false
  },
  loading: false,
  shipment: {
    _id: "test",
    carrierIds: ["carrier1"]
  },
  costData: {
    baseCurrency: "EUR",
    calculated: [
      {
        id: "FZFWXT",
        costId: "o6fLThAWhaWW3uDaj",
        description: "base rate to 47 Valladolid",
        tooltip: "Lane: 47 Valladolid, 175 EUR/shipment",
        amount: {
          value: 175,
          currency: "EUR"
        },
        source: "priceList",
        priceListId: "a87dJHymo9aPEn2m8",
        added: {
          by: "K3hqjR5zBoDZRccEx",
          at: "2020-03-03T13:29:05.775Z"
        },
        accountId: "S79207",
        isManualBaseCost: false,
        date: "2020-03-03T00:00:00.000Z",
        orgIndex: 0
      },
      {
        source: "input",
        costId: "4its7RuGpC33NE9jn",
        description: "test",
        amount: {
          value: 100,
          currency: "EUR"
        },
        added: {
          by: "K3hqjR5zBoDZRccEx",
          at: "2020-04-28T13:16:43.245Z"
        },
        accountId: "S79207",
        id: "NQMZUR",
        forApproval: true,
        isManualBaseCost: false,
        date: "2020-04-28T00:00:00.000Z",
        orgIndex: 1
      },
      {
        source: "input",
        costId: "4its7RuGpC33NE9jn",
        description: "test approval",
        amount: {
          value: 200,
          currency: "EUR"
        },
        added: {
          by: "K3hqjR5zBoDZRccEx",
          at: "2020-04-28T13:16:43.245Z"
        },
        accountId: "S79207",
        id: "NQMZUR",
        forApproval: false,
        response: { approved: true },
        isManualBaseCost: false,
        date: "2020-04-28T00:00:00.000Z",
        orgIndex: 2
      },
      {
        source: "input",
        costId: "4its7RuGpC33NE9jn",
        description: "test approval",
        amount: {
          value: 200,
          currency: "EUR"
        },
        added: {
          by: "K3hqjR5zBoDZRccEx",
          at: "2020-04-28T13:16:43.245Z"
        },
        accountId: "S79207",
        id: "NQMZUR",
        response: {
          reason: "agreement",
          approved: false,
          responded: {
            by: "K3hqjR5zBoDZRccEx",
            at: new Date("2019-09-27T10:47:29.011+02:00")
          }
        },
        forApproval: false,
        isManualBaseCost: false,
        date: "2020-04-28T00:00:00.000Z",
        orgIndex: 3
      }
    ],
    invoices: [
      {
        invoiceId: "2rvTKwvah5giwaaLi",
        invoiceNumber: "invoice6",
        sellerId: "C25419",
        invoiceCurrency: "EUR",
        invoiceDate: "2020-04-29",
        subtotal: 97,
        costs: [
          {
            amount: {
              value: 97,
              currency: "EUR",
              rate: 1
            },
            description: "base rate",
            costId: "o6fLThAWhaWW3uDaj",
            id: "CTETFB",
            orgIndex: 0,
            source: "invoice",
            isInvoice: true
          }
        ]
      }
    ],
    totalShipmentCosts: 275,
    totalInvoiceCosts: 97,
    totalInvoiceDelta: 178
  },
  onSave: console.log
};

export const full = () => {
  const props = cloneDeep(dummyProps);
  props.shipment.priceRequestId = undefined;
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <ShipmentCostsSection {...props} />
      </PageHolder>
    </MockedProvider>
  );
};

export const fullWithForeignCurrency = () => {
  const props = cloneDeep(dummyProps);
  props.shipment.priceRequestId = undefined;
  props.costData.calculated[1].amount = {
    value: 111.11,
    convertedQty: 100,
    rate: 0.9,
    currency: "USD"
  };

  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <ShipmentCostsSection {...props} />
      </PageHolder>
    </MockedProvider>
  );
};

export const fullWithPriceRequestId = () => {
  const props = cloneDeep(dummyProps);
  props.shipment.priceRequestId = "test123";
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <ShipmentCostsSection {...props} />
      </PageHolder>
    </MockedProvider>
  );
};
export const withoutCosts = () => {
  const props = cloneDeep(dummyProps);
  props.shipment.carrierIds = [];
  props.costData = {};
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <ShipmentCostsSection {...props} />
      </PageHolder>
    </MockedProvider>
  );
};

export const withCostOptions = () => {
  const props = cloneDeep(dummyProps);
  props.shipment.carrierIds = [];
  props.costData = {};
  props.lookupResult = JSON.parse(JSON.stringify(simpleResult));
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <ShipmentCostsSection {...props} />
      </PageHolder>
    </MockedProvider>
  );
};

export const withOneCostOptions = () => {
  const props = cloneDeep(dummyProps);
  props.shipment.carrierIds = [];
  props.costData = {};
  props.lookupResult = JSON.parse(JSON.stringify(simpleResult));
  props.lookupResult.costs = props.lookupResult.costs.slice(0, 1);
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <ShipmentCostsSection {...props} />
      </PageHolder>
    </MockedProvider>
  );
};
