import SecurityChecks from "/imports/utils/security/_security";
import { TenderBidMapping } from "../TenderBidMapping";
import { getTenderBidMappings } from "./query.getMappings";

export const removeTenderBidMapping = ({ accountId, userId }) => ({
  accountId,
  userId,
  context: { accountId, userId },
  async remove({ mappingId }) {
    const mapping = await TenderBidMapping.first(
      { _id: mappingId },
      { fields: { tenderBidId: 1 } }
    );
    SecurityChecks.checkIfExists(mapping);
    this.tenderBidId = mapping.tenderBidId;

    // remove:
    await mapping.destroy_async();
    return this;
  },
  getUIResponse() {
    return getTenderBidMappings(this.context)
      .init({ tenderBidId: this.tenderBidId })
      .get();
  }
});
