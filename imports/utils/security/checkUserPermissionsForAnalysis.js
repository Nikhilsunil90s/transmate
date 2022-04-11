import { SecurityCheck } from "./_securityCheck";

const debug = require("debug")("function:check-user-permissions");

class CheckAnalysisSecurity extends SecurityCheck {
  constructor({ analysis }, { accountId, userId }) {
    super({ accountId, userId });

    // specific here:
    this.analysis = analysis || {};

    this.role = {
      isOwner: this.analysis.accountId === this.accountId,
      isCeator: this.analysis.created?.by === this.userId
    };
  }

  can({ action }) {
    // controls the tab visibility:
    switch (action) {
      case "canEdit": {
        this.checks = {
          isCreator: this.role.isCreator
        };
        break;
      }
      default:
        debug("not allowed to do :", { action }); // means it is missing
        this.allowed = false;
    }

    this.checkAllowed();
    return this;
  }
}

export { CheckAnalysisSecurity };
