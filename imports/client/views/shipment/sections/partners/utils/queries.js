import gql from "graphql-tag";
import { fragments as accountFragments } from "/imports/api/allAccounts/apollo/fragments";

export const UPDATE_SHIPMENT_PARTNERS = gql`
  mutation updateShipmentPartner($input: UpdateShipmentPartnerInput!) {
    updateShipmentPartner(input: $input) {
      id
      shipperId
      carrierIds
      consigneeId
      providerIds

      shipper {
        ...accountBase
      }
      carrier {
        ...accountBase
      }
      consignee {
        ...accountBase
      }
    }
  }
  ${accountFragments.accountBase}
`;
