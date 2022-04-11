import gql from "graphql-tag";

export const GET_ADDRESS_ANNOTATION = gql`
  query getAddressForView($addressId: String!, $accountId: String) {
    address: getAddress(addressId: $addressId, accountId: $accountId) {
      id
      annotation {
        contacts {
          contactType
          type
          firstName
          lastName
          phone
          mail
        }
        name
        coding {
          code
          vendorId
          ediId
          color
        }
        externalId
        notes
        safety {
          instructions
          pbm
        }
        type
        certificates
        hours
      }
      street
      number
      bus
      zip
      city
      state
      country
      countryCode
      location {
        lat
        lng
      }
    }
  }
`;
