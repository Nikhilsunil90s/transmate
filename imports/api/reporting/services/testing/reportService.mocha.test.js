/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
import { expect } from "chai";

import { resetDb } from "/imports/api/zz_utils/services/server/loadFixtures/resetDb.js";
import { ReportSession } from "../../ReportSession";
import { reportingService } from "../reportingService";

const debug = require("debug")("price-request:overview:test");

let defaultMongo;
describe("report:service", function() {
  before(async () => {
    debug("create mongo connections");
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }
    debug("dynamic import of resetdb");
    await resetDb({ resetUsers: true });
  });
  it("get session for analyse", async function() {
    const accountId = "testAccount";
    const userId = "testUser";
    const REPORT_ID = "52098760-04e9-4d9e-92ea-10a7595acbda";
    const DATA_SET_ID =
      "analysis_simulation_details_with_scope_lanes_and_costs";

    const service = reportingService({ accountId, userId }).generateSessionId();
    await service.setupDb({
      dataSetId: DATA_SET_ID,
      reportId: REPORT_ID,
      filters: { analysisId: 1 }
    });
    expect(service.docId).to.not.equal(undefined);
    const sessionId = service.getEmbedUrl();
    expect(sessionId).to.be.a("string");

    const dbEntry = (await ReportSession.first(service.docId)) || {};
    debug("dbEntry %o", dbEntry);
    expect(dbEntry).to.contain.keys([
      "sessionId",
      "googleDataset",
      "filters",
      "table"
    ]);
  });
});
