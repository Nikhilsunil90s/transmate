import get from "lodash.get";
import { AnalysisSwitchPoint } from "/imports/api/analysis-switchpoint/AnalysisSwitchPoint";
import { PriceList } from "/imports/api/pricelists/PriceList";
import SecurityChecks from "/imports/utils/security/_security";

export const generateLanes = ({ accountId, userId }) => ({
  accountId,
  userId,
  async init({ analysisId }) {
    this.switchPoint = await AnalysisSwitchPoint.first({
      analysisId
    });
    SecurityChecks.checkIfExists(this.switchPoint);
    return this;
  },
  async generate({ priceListId }) {
    const priceList = await PriceList.first(priceListId, {
      fields: { lanes: 1 }
    });

    if (!priceList) throw new Error("Price list not found");
    const lanes = (priceList?.lanes || []).reduce((acc, cur) => {
      if (
        get(cur, ["from", "zones", 0, "CC"]) &&
        get(cur, ["to", "zones", 0, "CC"])
      ) {
        acc.push({
          from: {
            CC: cur.from.zones[0].CC,
            zip: cur.from.zones[0].from
          },
          to: {
            CC: cur.to.zones[0].CC,
            zip: cur.to.zones[0].from
          }
        });
      }
      return acc;
    }, []);

    await this.switchPoint.update_async({ lanes, priceListIds: [priceListId] });
    return this;
  },
  getUIResponse() {
    return this.switchPoint.reload();
  }
});
