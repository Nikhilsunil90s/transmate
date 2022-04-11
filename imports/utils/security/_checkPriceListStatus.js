export const checkPriceListStatus = function checkStatus(reffArr = [], value) {
  if (!reffArr.includes(value)) {
    if (!!this.setMessage) {
      this.setMessage(
        `The price list needs to be in ${reffArr.concat(
          ","
        )} status to perform this action`
      );
    }
    return false;
  }
  return true;
};
