import { Shipment } from "../../shipments/Shipment";

const FIELDS = { accountId: 1, shipperId: 1, status: 1 };

/**
 * @name printPickingList
 * @param {{accountId: String, userId: String}} param0
 * @returns {this}
 */
export const printPickingList = ({ accountId, userId }) => ({
  accountId,
  userId,

  /**
   * gets shipmentDocument
   * @method getAndFlag
   * @param {{shipmentId: String}} param0
   * @returns {this}
   * @async
   */
  async init({ shipmentId }) {
    this.shipmentId = shipmentId;
    this.shipment = await Shipment.first(shipmentId, { fields: FIELDS });
    if (!this.shipment) throw new Error("not found");

    // set security checks here... can only be shpped if it is fully picked!!!
    return this;
  },

  /**
   * calls external function to generate a document. url to document is returned
   * @method generatePickingList
   * @returns {this}
   */
  async generatePickingList() {
    // call external function to generate Document & URL
    // THIS NEEDS TO BE IMPLEMENTED
    this.documentUrl = "Some URL";

    // add printing document to the document list of the shipment
    return this;
  },

  /**
   * sets the shipmentStatus
   * @method setShipmentStatus
   * @returns {this}
   */
  async setShipmentStatus() {
    await this.shipment.update({ pickingStatus: "printed" });
    return this;
  },

  /**
   * return graphQl response value
   * @returns {{shipment:Object, documentUrl: String}}
   */
  getUIResponse() {
    return {
      shipment: {
        id: this.shipmentId,
        pickingStatus: "printed"
      },
      documentUrl: this.documentUrl
    };
  }
});
