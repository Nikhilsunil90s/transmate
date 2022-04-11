import gql from "graphql-tag";

export const fragments = {
  invoiceBase: gql`
    fragment invoiceBase on Invoice {
      id
      clientId
      creatorId
      sellerId
      status
      date
      number
      amount {
        value
        currency
      }
      costs {
        code
        description
        costId
      }
    }
  `
};
