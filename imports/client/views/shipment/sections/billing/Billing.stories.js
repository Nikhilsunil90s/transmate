import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import ShipmentBilling from "./Billing.jsx";
import { GET_BILLING_INFO } from "./queries";

export default {
  title: "Shipment/Segments/billing"
};

const SHIPMENT_ID = "2jG2mZFcaFzqaThcr";

const dummyProps = {
  shipmentId: SHIPMENT_ID,
  security: {
    canEditBilling: true
  }
};

const mocks = [
  {
    request: {
      query: GET_BILLING_INFO,
      variables: { shipmentId: SHIPMENT_ID }
    },
    result: {
      data: {
        billingInfo: {
          id: SHIPMENT_ID,
          totals: {
            base: 845.55,
            fuel: 0,
            additional: 0,
            manual: 845,
            total: 845.55,
            orgCurrency: "multi",
            targetCurrency: "EUR"
          },
          billing: {
            currency: "EUR",
            items: [
              {
                description: "Administration fee",
                amount: 50,
                invoiceId: null,
                isFreight: false,
                __typename: "shipmentBillingItem"
              },
              {
                description: "Freight",
                amount: 50,
                isFreight: false,
                invoiceId: "invoiceId1",
                __typename: "shipmentBillingItem"
              },
              {
                description: "Freight",
                amount: 50,
                isFreight: false,
                invoiceId: "invoiceId1",
                __typename: "shipmentBillingItem"
              }
            ],
            freightCost: 100, // used to calculate open amount in freight costs (that still needs to be invoiced)
            freightCostInvoiced: 100, // freight costs that are already invoiced
            __typename: "shipmentBilling"
          }
        }
      }
    }
  }
];
export const basic = () => {
  const props = { ...dummyProps };

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <PageHolder main="Shipment">
        <ShipmentBilling {...props} />
      </PageHolder>
    </MockedProvider>
  );
};
