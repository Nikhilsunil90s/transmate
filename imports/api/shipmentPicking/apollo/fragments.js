import gql from "graphql-tag";
import { fragments as shipmentFragments } from "/imports/api/shipments/apollo/fragments";

export const fragments = {
  pickingOverviewFragment: gql`
    fragment pickingOverviewFragment on ShipmentAggr {
      id
      ...shipmentReferences
    }
    ${shipmentFragments.shipmentReferences}
  `,
  pickingLabelOption: gql`
    fragment pickingLabelOption on PickingLabelOption {
      rateId
      amount
      currency
      amountLocal
      currencyLocal
      provider
      providerImage75
      providerImage200
      serviceLevel {
        name
        token
        terms
      }
      days
      arrivesBy
      durationTerms
      messages
      carrierAccount
      test
      zone
      charges
    }
  `
};
