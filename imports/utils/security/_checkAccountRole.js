export const checkAccountRole = function checkRole(reffArr = [], value) {
  if (!reffArr.includes(value)) {
    if (!!this.setMessage) {
      this.setMessage(
        `You should be ${reffArr.concat(
          "/"
        )} of this document to perform this action`
      );
    }
    return false;
  }
  return true;
};
