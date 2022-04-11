import gql from "graphql-tag";
import { fragments as addressFragments } from "/imports/api/addresses/apollo/fragments";

export const GET_ADDRESS_WITH_ANNOTATION = gql`
  query getAddressPage($addressId: String!, $accountId: String) {
    address: getAddress(addressId: $addressId, accountId: $accountId) {
      ...addressBase
      ...addressAnnotation
    }
  }
  ${addressFragments.addressBase}
  ${addressFragments.addressAnnotation}
`;

export const ANNOTATE_ADDRESS = gql`
  mutation annotateAddress($input: AnnotateAddressInput!) {
    annotateAddress(input: $input) {
      ...addressBase
      ...addressAnnotation
    }
  }
  ${addressFragments.addressBase}
  ${addressFragments.addressAnnotation}
`;

export const SAVE_ADDRESS_CONTACTS = gql`
  mutation saveAddressContacts($input: SaveAddressContactsInput!) {
    saveAddressContacts(input: $input)
  }
`;

export const GET_ASIDE_INFO = gql`
  query getAddressInfo($addressId: String!) {
    address: getAddress(addressId: $addressId) {
      ...addressBase
    }
    shipments: getShipmentsForAddress(addressId: $addressId) {
      id
      number
      created {
        by
        at
      }
      direction
    }
  }
  ${addressFragments.addressBase}
`;
