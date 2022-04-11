import { PriceListUICore } from "./grid__class_core";
import { buildGridQuery } from "./grid_buildQuery";
import { getGridData } from "./grid_getData";
import { GET_PRICELIST_RATES } from "/imports/client/views/price-list/utils/queries";

const debugGrid = require("debug")("price-list:grid");

// small class that ads in the data querying logic
class PriceListUIData extends PriceListUICore {
  async getData(callback) {
    const query = buildGridQuery({ pageFilters: this.pageFilters });

    debugGrid("db query: %o", query);

    let cellData = this.mock ? this.mock.cellData : null;
    if (!cellData && this.client) {
      cellData = await new Promise((resolve, reject) => {
        this.client
          .query({
            query: GET_PRICELIST_RATES,
            variables: {
              priceListId: this.doc.id,
              query,
              inGrid: true
            },
            fetchPolicy: "network-only"
          })
          .then(res => {
            resolve(res.data?.results);
          })
          .catch(error => reject(error));
      });
    }
    getGridData.apply(this, [cellData]);

    if (typeof callback === "function") callback();
  }

  isEmpty() {
    return !(
      this.doc.lanes != null ||
      this.doc.volumes != null ||
      this.doc.equipments != null
    );
  }
}

export { PriceListUIData };
