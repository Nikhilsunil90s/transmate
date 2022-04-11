/* eslint-disable react/static-property-placement */
/* eslint-disable lines-between-class-members */
import moment from "moment";
import get from "lodash.get";
import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";
import { CheckTenderifySecurity } from "../../../utils/security/checkUserPermissionsForTenderify";

// collections
import { TenderBid } from "../TenderBid";
import { TenderBidMapping } from "../../tender-bids-mapping/TenderBidMapping";
import { AllAccounts } from "../../allAccounts/AllAccounts";

import { TenderBidType } from "../interfaces/tenderBid";
import { FileStoreWithId } from "/imports/api/documents/interfaces/files.d";

const debug = require("debug")("tenderBid:service-class");

class TenderBidService {
  accountId: string;
  userId: string;
  context: { accountId: string; userId: string };
  tenderBidId: string;
  tenderBid: TenderBidType;
  tenderBidMap: any;
  mappingId: string;

  constructor({ accountId, userId }) {
    this.accountId = accountId;
    this.userId = userId;
    this.context = { accountId, userId };
  }

  async fetchTenderBidDoc({ tenderBidId }) {
    this.tenderBidId = tenderBidId;

    this.tenderBid = await TenderBid.first(
      { _id: tenderBidId },
      {
        fields: {
          tenderBidId: 1,
          offer: 1,
          contacts: 1,
          status: 1,
          accountId: 1
        }
      }
    );
    if (!this.tenderBid) throw new Error("Tender bid document not found");
    return this;
  }

  async fetchTenderBidMapping() {
    this.tenderBidMap = await TenderBidMapping.first(
      { tenderBidId: this.tenderBidId },
      { fields: { tenderBidId: 1 } }
    );
    if (!this.tenderBidMap)
      throw new Error("Tender bid mapping document not found");

    // Watchout: is objectId:
    // eslint-disable-next-line no-underscore-dangle
    this.mappingId = this.tenderBidMap.id;
    return this;
  }

  async runChecks({ action }) {
    const check = new CheckTenderifySecurity(
      {
        tenderBid: this.tenderBid
      },
      this.context
    );
    await check.getUserRoles();
    check.can({ action }).throw();
    return this;
  }

  init(tenderBid: TenderBidType) {
    this.tenderBid = tenderBid;
    return this;
  }

  /**
   * adds an updates entry to the update array
   * @param {Object} param0 root
   * @param {String} action type of action
   * @param {Object=} data  optional data
   */
  auditTrail({ action, data = {} }: { action: string; data?: any }) {
    this.tenderBid.push({
      updates: {
        action,
        data,
        userId: this.userId,
        ts: new Date()
      }
    });
  }

  async updateDoc(update: any) {
    await this.tenderBid.update_async(update);
    this.auditTrail({ action: "update" });
    return this;
  }

  async selectPartner({ partnerId }: { partnerId: string }) {
    // enrich with account specific data:
    const partner = await AllAccounts.first(
      { _id: partnerId },
      {
        fields: {
          name: 1,
          accounts: { $elemMatch: { accountId: this.accountId } }
        }
      }
    );

    if (!partner) throw new Error("Partner not found");
    const accountInfo = partner?.accounts?.[0] || {};
    const { management, contacts } = accountInfo?.profile || {};

    await this.tenderBid.update_async({
      partnerId,
      partner: {
        id: partnerId,
        name: accountInfo.name || partner.name,
        management,
        contacts
      }
    });
    return this;
  }

  async addDocument({ meta, store, id }: FileStoreWithId) {
    const document = {
      id,
      store,
      meta: { ...meta, lastModifiedDate: new Date(meta.lastModifiedDate) }
    };
    await this.tenderBid.push({
      "source.documents": document
    });
    this.auditTrail({ action: "addDocument", data: { document } });
    return this;
  }

  async removeDocument({ documentId }: { documentId: string }) {
    debug("remove doc %o", documentId);
    await this.tenderBid.pull_async({ "source.documents": { id: documentId } });
    this.auditTrail({ action: "removeDocument", data: { documentId } });
    return this;
  }

  addWorkflow(workflowDoc: any) {
    this.tenderBid.push({
      workflows: { id: workflowDoc._id }
    });
    this.auditTrail({ action: "addWorkflow", data: { id: workflowDoc._id } });
    return this;
  }

  async generateOffer() {
    // arrange history & meta data:
    let { offer = {} } = this.tenderBid;
    const latestVersion = get(offer, ["latest", "version"], 0);
    const validFrom =
      offer.latest?.validFrom ||
      moment()
        .startOf("day")
        .toDate();

    const validTo =
      offer.latest?.validTo ||
      moment()
        .add(1, "year")
        .startOf("day")
        .toDate();

    offer = {
      ...offer,
      latest: {
        version: latestVersion + 1,
        ts: new Date(),
        file: "pending",
        validFrom,
        validTo
      },
      history: offer.latest
        ? [
            {
              ts: new Date(),
              validFrom,
              validTo,
              version: latestVersion,
              ...offer.latest
            },
            ...(offer.history || [])
          ]
        : []
    };
    await this.tenderBid.update_async({ offer });

    // is not returning anything-> modifies db >> fetch UI response in next step
    await callCloudFunction(
      "tenderifyWritePricelist",
      {
        accountId: this.accountId,
        tenderBidId: this.tenderBid._id,
        mappingId: this.mappingId
      },
      this.context
    );

    return this;
  }

  get() {
    return this.tenderBid;
  }

  getUIResponse({ fields = {} }) {
    return TenderBid.first(
      { _id: this.tenderBidId },
      { fields: { id: "$_id", ...fields } }
    );
  }
}

export { TenderBidService };
