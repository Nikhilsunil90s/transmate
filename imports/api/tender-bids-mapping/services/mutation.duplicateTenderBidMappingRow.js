import get from "lodash.get";
import SecurityChecks from "/imports/utils/security/_security";

// collections
import { TenderBidMapping } from "../TenderBidMapping";

const debug = require("debug")("tenderBid:mapping");

export const duplicateTenderBidMappingRow = ({ accountId, userId }) => ({
  accountId,
  userId,
  dbUpdate: {},
  async init({ mappingId }) {
    this.mappingId = mappingId;
    this.tenderBidMap = await TenderBidMapping.first({ _id: mappingId });
    SecurityChecks.checkIfExists(this.tenderBidMap);
    return this;
  },
  async duplicate({ topic, originId }) {
    // we get a key & a originId -> insert the item in the array & increment the rest
    const original = get(this.tenderBidMap, ["mappingV", topic, "data"]).sort(
      (a, b) => a.originId - b.originId
    );

    const idx = original.findIndex(el => el.originId === originId);
    if (!(idx > -1)) throw new Error("could not find originId in mappings");

    const duplicatedEl = Object.entries(original[idx] || {}).reduce(
      (acc, [k, v]) => {
        acc[k] = k.includes("target") ? null : v;
        return acc;
      },
      {}
    );
    const mod = original.map(({ originId: i, ...mapping }) => ({
      originId: i <= idx ? i : i + 1,
      ...mapping
    }));
    mod.splice(idx + 1, 0, {
      ...duplicatedEl,
      originId: idx + 1,
      ...(topic === "lanes" ? { validated: false } : {})
    });
    debug("duplicating mapping row %o", { topic, mod });
    await this.tenderBidMap.update_async({ [`mappingV.${topic}.data`]: mod });
    return this;
  },
  getUIResponse() {
    return this.tenderBidMap.reload();
  }
});
