import { Random } from "/imports/utils/functions/random.js";
import moment from "moment";
import get from "lodash.get";

import { ReportSession } from "../ReportSession";
import { getUserEntities } from "/imports/api/users/services/_roleFn";

const debug = require("debug")("report:service");

export const reportingService = ({ accountId, userId }) => ({
  reportUrl: process.env.IBM_FUNCTION_CUSTOMER_API,
  googleDataset: process.env.GOOGLE_DATASET,
  reportingTarget: process.env.REPORTING_TARGET,
  accountId,
  userId,
  generateSessionId() {
    this.sessionId = Random.id(46);
    return this;
  },
  async setupDb({ dataSetId, reportId, filters = {} }) {
    debug("setup db %o", { dataSetId, reportId, filters });
    this.reportId = reportId;

    // set user entity as filter, filter user entities
    this.entities = await getUserEntities(
      this.userId,
      this.accountId,
      get(filters, "entities")
    );

    this.doc = await ReportSession.create_async({
      expires: moment()
        .add(1, "day")
        .toDate(),
      sessionId: this.sessionId,
      googleDataset: this.googleDataset,
      table: dataSetId,
      accessFilter: {
        userId: this.userId,
        accountId: this.accountId,
        entities: this.entities
      },
      filters: {
        ...filters,
        accountId: this.accountId
      }
    });
    this.docId = this.doc.id;
    return this;
  },
  get() {
    return this.sessionId;
  },
  getEmbedUrl() {
    return `https://datastudio.google.com/embed/reporting/${
      this.reportId
    }?params=${encodeURIComponent(
      JSON.stringify({
        sessionId: this.sessionId,
        target: this.reportingTarget
      })
    )}`;
  },
  getDownloadUrl() {
    return `${this.reportUrl}/reporting?target=${this.reportingTarget}&sessionId=${this.sessionId}`;
  }
});
