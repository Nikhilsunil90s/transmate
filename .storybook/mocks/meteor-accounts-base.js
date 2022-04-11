const debug = require("debug")("mock:accounts");
module.exports = {
  Accounts: {
    resetPassword: () => {},
    setPassword: () => {},
    _generateStampedLoginToken(...args) {
      debug("_generateStampedLoginToken", args);
      return 1;
    },
    _insertLoginToken(userId, meteorToken) {
      debug("_insertLoginToken", userId, meteorToken);
      return true;
    }
  }
};
