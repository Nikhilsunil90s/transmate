import React from "react";
import { Trans } from "react-i18next";
import { Segment } from "semantic-ui-react";
import ReportingItem from "/imports/client/views/reporting/ReportingItem.jsx";

const REPORT_ID = "52098760-04e9-4d9e-92ea-10a7595acbda";
const DATA_SET_ID = "analysis_simulation_details_with_scope_lanes_and_costs";

// const debug = require("debug")("reporting:view:analysis");
const ReportTab = ({ ...props }) => {
  const { simulation, analysisId } = props;
  const hasResultData = !!simulation?.aggregates;

  if (!hasResultData)
    return (
      <Segment padded="very">
        <p>
          <Trans i18nKey="analysis.simulation.nodata" />
        </p>
      </Segment>
    );
  return (
    <ReportingItem
      report={{
        dataSetId: DATA_SET_ID,
        reportId: REPORT_ID,
        filters: { analysisId }
      }}
    />
  );
};

export default ReportTab;
