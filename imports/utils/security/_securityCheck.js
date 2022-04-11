import { getRolesForUser } from "/imports/api/users/services/_roleFn";

const debug = require("debug")("security-check:class");

class SecurityCheck {
  // #allowed; hidden property?
  constructor({ accountId, userId }) {
    if (!accountId || !userId)
      throw new Error("Security > set accountId & userId");

    this.userId = userId;
    this.accountId = accountId;
    this.allowed = false;
    this.errorMessage = "You are not allowed to perform this action";
  }

  /**
   * On server, gets the user roles for the account in an array to check against it
   * can be chained in server side code in the security check
   *
   * @method getUserRoles
   */
  async getUserRoles() {
    this.userRoles = new Set([
      ...(await getRolesForUser(this.userId, this.accountId, false))
    ]);
    return this;
  }

  checkUserHasRoles(roles = []) {
    return roles.every(role => this.userRoles && this.userRoles.has(role));
  }

  /** manually inject the user roles */
  setUserRoles(roles = []) {
    this.userRoles = new Set([...roles]);
    return this;
  }

  setContext({ userId, accountId, roles }) {
    this.userId = userId;
    this.accountId = accountId;
    this.setUserRoles(roles);
    return this;
  }

  setResponse(response) {
    debug("setResponse %o", response);
    if (typeof response === "object" && response !== null) {
      this.allowed = response.allowed;
      this.errorMessage = response.errMessage;
    } else {
      this.allowed = response || false;
    }
  }

  setMessage(message) {
    if (!!message) {
      this.errorMessage = message;
    }
  }

  ruleCheck(ruleCheck, msg) {
    if (!ruleCheck && msg) {
      this.errorMessage = msg;
    }
    return ruleCheck;
  }

  checkAllowed() {
    const runCheck = (checkObj = {}) => Object.values(checkObj).every(x => x);

    if (Object.keys(this.checks || {}).length) {
      if (this.multiCheck) {
        this.allowed = Object.values(this.checks).some(runCheck);
      } else {
        this.allowed = runCheck(this.checks);
      }
    }
  }

  check(log) {
    if (this.allowed) {
      this.errorMessage = null;
    }
    if (!this.allowed && log) debug({ checks: this.checks });
    return this.allowed;
  }

  throw() {
    if (!this.allowed) {
      debug(this.userId, " is not-allowed", this.checks, this.errorMessage);
      throw new Error("not-allowed", this.errorMessage);
    }
  }

  get(item) {
    return this[item];
  }
}

export { SecurityCheck };
