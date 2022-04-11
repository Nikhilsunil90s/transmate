import { TenderBid } from "../TenderBid";
import { TenderBidType } from "../interfaces/tenderBid.d";

import {
  CheckTenderifySecurity,
  dbFields
} from "../../../utils/security/checkUserPermissionsForTenderify";

interface UpdateTenderBid {
  context: { accountId: string; userId: string };
  tenderBidId?: string;
  // eslint-disable-next-line no-undef
  tenderBid?: Partial<TenderBidType>;
  init: (
    this: UpdateTenderBid,
    a: { tenderBidId: string }
  ) => Promise<UpdateTenderBid>;
  runChecks: (this: UpdateTenderBid) => Promise<UpdateTenderBid>;
  update: (a: { updates: any }) => Promise<UpdateTenderBid>;
  getUIResponse: () => TenderBidType;
}

export const updateTenderBid: (a: {
  accountId: string;
  userId: string;
}) => UpdateTenderBid = ({ accountId, userId }) => ({
  context: { accountId, userId },
  async init({ tenderBidId }) {
    this.tenderBidId = tenderBidId;

    this.tenderBid = await TenderBid.first(
      { _id: tenderBidId },
      { fields: dbFields }
    );

    if (!this.tenderBid) throw new Error("Tender bid document not found");
    return this;
  },
  async runChecks() {
    const srv = new CheckTenderifySecurity(
      {
        tenderBid: this.tenderBid
      },
      this.context
    );
    await srv.getUserRoles();
    srv.can({ action: "editGeneral" }).throw();
    return this;
  },
  async update({ updates }) {
    if (Object.keys(updates).length) {
      const updateDot = Object.entries(updates).reduce((acc, [k, v]) => {
        if (k === "settings") {
          Object.entries(v).forEach(([settingKey, settingValue]) => {
            acc[`settings.${settingKey}`] = settingValue;
          });
        } else {
          acc[k] = v;
        }
        return acc;
      }, {});

      await this.tenderBid.update_async(updateDot);
    }
    return this;
  },
  getUIResponse() {
    return this.tenderBid.reload();
  }
});
