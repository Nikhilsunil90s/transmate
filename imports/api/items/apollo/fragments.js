import gql from "graphql-tag";

export const fragments = {
  itemDetail: gql`
    fragment itemDetail on ShipmentItemType {
      shipmentId
      parentItemId
      level
      quantity {
        amount
        code
      }
      type
      itemType
      number
      description
      commodity
      references {
        order
        delivery
        containerNo
        truckId
        trailerId
        document
        seal
      }
      material {
        id
        description
      }
      DG
      DGClassType
      temperature {
        condition
        range {
          from
          to
          unit
        }
      }
      weight_net
      weight_tare
      weight_gross
      weight_unit
      dimensions {
        length
        width
        height
        uom
      }
      taxable {
        type
        quantity
      }
      calcSettings {
        costRelevant
        itemize
        keys
        linkField
      }
      customs {
        HScode
        countryOfOrigin
        value
        currency
      }
      notes
    }
  `,
  itemPickingDetail: gql`
    fragment itemPickingDetail on ShipmentItemType {
      id
      type
      itemType
      description
      level
      parentItemId
      references {
        order
        delivery
        containerNo
        truckId
        trailerId
        document
        seal
        trackingNumber
      }
      DG
      quantity {
        code
        amount
        description
      }
      weight_net
      weight_gross
      weight_unit
      temperature {
        condition
        range {
          from
          to
          unit
        }
      }
      dimensions {
        length
        width
        height
        uom
      }

      isPicked
      isPackingUnit
      labelUrl
    }
  `
};
