export const generatePackItemsArgs = ({ shipmentId, shipmentItemIds }) => ({
  shipmentId,
  shipmentItemIds,
  parentItem: {
    id: null, // null means that the item needs to be created
    weight_net: 100,
    weight_tare: 20,
    weight_gross: 210,
    weight_unit: "kg",
    code: "PARCEL",
    description: "parcel",
    dimensions: {
      length: 100,
      width: 200,
      height: 300,
      uom: "cm"
    }
  }
});
