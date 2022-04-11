import get from "lodash.get";
import { ShipmentsView } from "/imports/api/views/ShipmentsView";
import SecurityChecks from "../../../utils/security/_security";
import { updateUser } from "/imports/api/users/services/mutation.updateUser";

export const upsertShipmentView = ({ accountId, userId }) => ({
  userId,
  accountId,
  async insert() {
    this.view = await ShipmentsView.create_async({
      ...this.data,
      accountId,
      created: { by: this.userId, at: new Date() }
    });
  },
  async update() {
    this.view = await ShipmentsView.first(this.viewId);
    SecurityChecks.checkIfExists(this.view);

    const allowUpdate =
      this.view.type !== "global" &&
      get(this.view, "created.by") === this.userId;
    if (!allowUpdate) throw new Error("Not allowed");

    if (
      this.data.columns &&
      this.view.columns &&
      this.data.columns.length !== this.view.columns.length
    ) {
      // Columns have changed; delete stored sort order
      await this.view.del("order");
    }
    await this.view.update(this.data);
  },
  async upsert({ viewId, asNew, data }) {
    this.viewId = viewId;
    this.data = data;
    if (viewId && !asNew) {
      await this.update();
    } else {
      await this.insert();
    }
    return this;
  },
  async saveToViewPreferences() {
    const srv = updateUser({ userId, accountId });
    await srv.init({ userId });
    await srv.updatePreferences({
      updates: { "views.shipments": this.view.id }
    });
    return this;
  },
  getUIResponse() {
    return this.view.reload();
  }
});
