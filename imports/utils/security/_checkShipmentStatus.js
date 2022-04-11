export const checkShipmentStatus = function checkShipStatus(
  reffArr = [],
  value
) {
  if (!reffArr.includes(value)) {
    if (!!this.setMessage) {
      this.setMessage(
        `The shipment needs to be in ${reffArr.concat(
          ","
        )} status to perform this action`
      );
    }
    return false;
  }
  return true;
};
