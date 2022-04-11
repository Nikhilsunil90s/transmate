// data
import { ShipmentsView } from "../ShipmentsView";

// fn
import { shipmentOverViewAggregation } from "./OverviewAggregation";
import { shipmentOverViewBigQuery } from "./OverviewBigQuery";

const debug = require("debug")("shipment:overview");

export const getPagedShipmentOverview = ({ accountId, userId }) => ({
  accountId,
  userId,
  result: {
    data: [],
    recordsTotal: 0,
    recordsFiltered: 0,
    jobId: null
  },
  async get({ viewId, jobId, start, length, sort }) {
    this.result.jobId = jobId;
    debug(
      "start overview paged method , jobid %s, with start %s and length",
      jobId,
      start,
      length
    );

    const view = await ShipmentsView.first(viewId);
    if (!view) return this.result;

    debug("view %o", view);
    debug("view filters :  %o", view.filters);

    // WRONG: a partner that is assigned has no entities BUT DOES HAVE ACCESS!!
    // view.filters.entities = {
    //   values: await getUserEntities(
    //     this.userId,
    //     this.accountId,
    //     get(view, "filters.entities.values")
    //   )
    // };

    debug(
      "filter : %o , columns %o, sort %o",
      view.filters,
      view.columns,
      sort
    );

    // default to bq shipment overview, on all data
    if (!view.shipmentOverviewType || view.shipmentOverviewType === "GBQ") {
      return shipmentOverViewBigQuery({
        userId: this.userId,
        accountId,
        view,
        sort,
        start,
        length
      });
    }

    // mongo db shipment overview
    const srv = shipmentOverViewAggregation({
      userId: this.userId,
      accountId: this.accountId,
      view,
      sort,
      start,
      length
    });
    await srv.prepareSearch();
    return srv
      .getshipmentDoc()
      .getItemDocs()
      .getPartnerInfo()
      .getProjectInfo()
      .getEntityInfo()
      .getStageInfo()
      .applyDateFilters()
      .getInvoiceInfo()
      .applyCostFilters()
      .projectFields()
      .sort()
      .fetch(view.direct);
  }
});
