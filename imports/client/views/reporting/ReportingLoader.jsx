import React from "react";
import { useQuery } from "@apollo/client";
import Reporting from "./Reporting.jsx";
import { GET_REPORTS } from "./utils/queries";

const debug = require("debug")("reporting");

/**
 * loads the different reports from the database [public] [custom]
 * each report has { dataSetId, reportId }
 * when a report has been selected, a sessionId is generated that allows to view the data
 */

const ReportingLoader = () => {
  const { loading, data = {}, error } = useQuery(GET_REPORTS, {
    fetchPolicy: "cache-first"
  });
  const { reports } = data;

  debug("fetching reports, result: %o", { data, error });
  return loading ? "loading" : <Reporting reports={reports} />;
};

export default ReportingLoader;
