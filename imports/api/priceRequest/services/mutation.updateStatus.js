import { JobManager } from "../../../utils/server/job-manager.js";
import SecurityChecks from "/imports/utils/security/_security";
import { CheckPriceRequestSecurity } from "/imports/utils/security/checkUserPermissionsForRequest";
import { PriceRequest } from "../PriceRequest";
import { priceRequestService } from "./priceRequest";

const debug = require("debug")("price-request:resolvers");

export const updateStatus = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ priceRequestId }) {
    this.priceRequest = await PriceRequest.first(priceRequestId);
    this.srv = await priceRequestService({ accountId, userId }).init({
      priceRequest: this.priceRequest
    });

    SecurityChecks.checkIfExists(this.priceRequest);
    return this;
  },
  //#region internal fn
  async setToRequested() {
    const check = new CheckPriceRequestSecurity(
      {
        request: this.priceRequest
      },
      {
        userId: this.userId,
        accountId: this.accountId
      }
    );
    await check.getUserRoles();
    check.can({ action: "canBeRequested" }).throw();

    debug("->request");

    // increase version of price request
    // we could use $inc but then we need to use ._collection call on db
    await this.srv.update_async({
      status: "requested",
      version: this.priceRequest.version + 1
    });
    await this.srv.allowShipmentAccess(true);
    this.priceRequest = await this.srv.get();
    JobManager.post("price-request.requested", this.priceRequest);
    return this.priceRequest;
  },
  async setToDraft() {
    const check = new CheckPriceRequestSecurity(
      {
        request: this.priceRequest
      },
      {
        userId: this.userId,
        accountId: this.accountId
      }
    );
    await check.getUserRoles();
    check.can({ action: "canBeSetBackToDraft" }).throw();
    debug("->draft");
    await this.srv.update_async({ status: "draft" });
    await this.srv.allowShipmentAccess(false);
    this.priceRequest = await this.srv.get();

    JobManager.post("price-request.draft", this.priceRequest);
    return this.priceRequest;
  },

  async archive() {
    // no notifications needed, status as is is saved , allow reporting
    const check = new CheckPriceRequestSecurity(
      {
        request: this.priceRequest
      },
      {
        userId: this.userId,
        accountId: this.accountId
      }
    );
    await check.getUserRoles();
    check.can({ action: "canBeArchived" }).throw();
    debug("->archive");
    await this.srv.update_async({ status: "archived" });
    await this.srv.allowShipmentAccess(false);
    this.priceRequest = await this.srv.get();
    return this.priceRequest;
  },
  async delete() {
    const check = new CheckPriceRequestSecurity(
      {
        request: this.priceRequest
      },
      {
        userId: this.userId,
        accountId: this.accountId
      }
    );
    await check.getUserRoles();
    check.can({ action: "canBeDeleted" }).throw();
    debug("->delete");
    debug("will remove links on shipments to pr %s", this.priceRequest._id);
    await this.srv;
    await this.srv.update_async({ status: "deleted" });
    await this.srv.allowShipmentAccess(false);
    this.priceRequest = await this.srv.get();

    JobManager.post("price-request.cancelled", {
      priceRequest: this.priceRequest
    });
    return this.priceRequest;
  },
  //#endregion
  async updateStatus({ action }) {
    switch (action) {
      case "request":
        await this.setToRequested();
        break;
      case "setToDraft":
        await this.setToDraft();
        break;
      case "archive":
        await this.archive();
        break;
      case "delete":
        await this.delete();
        break;
      case "deActivate":
        await this.deActivate();
        break;
      default:
        throw new Error(`invalid action: ${action}`);
    }
    return this;
  },
  getUIResponse() {
    return this.priceRequest.reload();
  }
});
