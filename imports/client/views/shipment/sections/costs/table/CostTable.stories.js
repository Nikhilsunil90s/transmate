import React from "react";
import { MockedProvider } from "@apollo/client/testing";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import CostItemTable from "./CostItemTable.jsx";
import CostTable from "./CostTable.jsx";

export default {
  title: "Shipment/Segments/costs/costTable"
};

const dummyProps = {
  shipment: { _id: "testId", carrierIds: ["C11111"] },
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
          value: 110,
          currency: "USD"
        },
        added: {
          by: "K3hqjR5zBoDZRccEx",
          at: "2020-04-28T13:16:43.245Z"
        },
        accountId: "S79207",
        sellerId: "C12345",
        id: "NQMZUR",
        forApproval: true,
        isManualBaseCost: false,
        date: "2020-04-28T00:00:00.000Z",
        orgIndex: 1
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
  onSave: console.log,
  security: {
    canViewCostLabel: () => true,
    canApproveDecline: () => false,
    canRemoveManualCost: () => false
  }
};

export const Full = () => {
  const props = { ...dummyProps };
  return (
    <MockedProvider mocks={[]}>
      <PageHolder main="Shipment">
        <CostTable {...props} />
      </PageHolder>
    </MockedProvider>
  );
};

export const CalculatedCosts = () => {
  const { costData, otherProps } = dummyProps;
  const { calculated, baseCurrency } = costData || {};
  const props = {
    ...dummyProps,
    ...otherProps,
    costs: calculated,
    baseCurrency
  };
  return (
    <MockedProvider mocks={[]}>
      <PageHolder main="Shipment">
        <CostItemTable {...props} />
      </PageHolder>
    </MockedProvider>
  );
};

// export const withManualCosts = () => {
//   const props = { ...dummyProps };
//   props.costs = [
//     ...props.costs,
//     {
//       source: "input",
//       costId: "4its7RuGpC33NE9jn",
//       description: "test",
//       amount: {
//         value: 100,
//         currency: "EUR"
//       },
//       added: {
//         by: "K3hqjR5zBoDZRccEx",
//         at: new Date("2020-04-28T15:16:43.245+02:00")
//       },
//       accountId: "S79207",
//       id: "NQMZUR",
//       forApproval: true,
//       isManualBaseCost: false,
//       date: new Date("2020-04-28T02:00:00.000+02:00")
//     }
//   ];
//   return (
//     <PageHolder main="Shipment">
//       <CostItemTable {...dummyProps} />
//     </PageHolder>
//   );
// };
