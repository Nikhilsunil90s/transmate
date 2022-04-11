import { bigQuery, sqlBuild } from "@transmate-eu/bigquery_module_transmate";
import { getUserEntities } from "/imports/api/users/services/_roleFn";

const debug = require("debug")("bq:shipment-overview-bq");

export const shipmentOverViewBigQuery = async ({
  userId,
  accountId,
  view,
  jobId,
  start,
  length,
  sort
}) => {
  const result = {
    data: [],
    recordsTotal: 0,
    recordsFiltered: 0,
    jobId
  };

  // make sure it filters on entities
  const entities = await getUserEntities(userId, accountId);
  const sql = sqlBuild.getSql(
    view.columns,
    { ...view.filters, accessFilter: { accountId, entities, userId } },
    sort
  );
  debug("sql :  %s", sql);
  if (!process.env.GOOGLE_CREDENTIALS) {
    // no google credentials, so no need to try to call bq
    // return sql to debug
    debug("missing google key, so we return mocked result");
    return { recordsTotal: 1, recordsFiltered: 1, data: [], sql };
  }
  return bigQuery
    .getOverviewData(jobId, sql, start, length)
    .then(data => {
      if (data.length === 3) {
        debug("data :  %o", data);
        debug("jobid : %o", data[2].jobReference.jobId);
        result.data = sqlBuild.remapObject(data[0]);
        result.recordsTotal = parseInt(data[2].totalRows, 10) || 0;
        result.recordsFiltered = parseInt(data[2].totalRows, 10) || 0;
        result.jobId = data[2].jobReference.jobId;
        return result;
      }
      console.error("data length of return  BQ object is not 3!");
      return result;
    })
    .catch(err => {
      console.error("error with bq module!", err);
      return result;
    });
};
