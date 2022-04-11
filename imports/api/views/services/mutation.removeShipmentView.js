import get from "lodash.get";
import { ShipmentsView } from "/imports/api/views/ShipmentsView";
import SecurityChecks from "../../../utils/security/_security";
import { updateUser } from "/imports/api/users/services/mutation.updateUser";

const DEFAULT_VIEW_ID = "Hqsf7JEYAwzuXMRg7";

export const removeShipmentView = ({ accountId, userId }) => ({
  userId,
  accountId,
  async init({ viewId }) {
    this.viewId = viewId;
    this.view = await ShipmentsView.first(this.viewId);
    SecurityChecks.checkIfExists(this.view);

    const allowUpdate =
      this.view.type !== "global" &&
      get(this.view, "created.by") === this.userId;
    if (!allowUpdate) throw new Error("Not allowed");

    return this;
  },
  remove() {
    this.view.destroy();
    return this;
  },
  async saveToViewPreferences() {
    const srv = updateUser({ userId, accountId });
    await srv.init({ userId });
    await srv.updatePreferences({
      updates: { "views.shipments": DEFAULT_VIEW_ID }
    });
    return this;
  }
});
