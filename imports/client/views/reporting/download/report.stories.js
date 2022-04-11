import React from "react";

import { ReportDownload } from "./Report";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import publicReports from "/imports/api/reporting/enums/publicReports.json";
import reportFilters from "/imports/api/reporting/enums/reportFilters.json";

const debug = require("debug")("reporting:download:story");

export default {
  title: "Reporting/download"
};

const reports = {
  public: Object.entries(publicReports).map(([key, value]) => ({
    key,
    filterKeys: reportFilters[value.dataSetId],
    ...value
  })),
  custom: []
};

export const download = () => {
  debug("build download list", reports.public);
  return (
    <PageHolder main="Reporting">
      <ReportDownload reports={reports.public} />
    </PageHolder>
  );
};
