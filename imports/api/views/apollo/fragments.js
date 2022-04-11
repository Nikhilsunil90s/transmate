import gql from "graphql-tag";

export const fragments = {
  shipmentViewBase: gql`
    fragment shipmentViewBase on ShipmentViewType {
      id
      name
      type
      accountId
      isShared
      created {
        by
        at
      }
    }
  `,
  shipmentView: gql`
    fragment shipmentView on ShipmentViewType {
      id
      name
      type
      accountId
      isShared
      columns
      filters
      order {
        col
        dir
      }
      shipmentOverviewType
      created {
        by
        at
      }
    }
  `
};
