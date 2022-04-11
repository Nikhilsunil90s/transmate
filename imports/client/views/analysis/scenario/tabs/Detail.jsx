import React from "react";
import { Segment } from "semantic-ui-react";
import ScenarioStatistic from "../components/ScenarioStatistic";
import AllocationGrid from "../components/AllocationGrid";

const ScenarioDetailTab = ({ ...props }) => {
  return (
    <>
      <Segment padded="very" content={<ScenarioStatistic {...props} />} />
      <Segment padded="very" content={<AllocationGrid {...props} />} />
    </>
  );
};

export default ScenarioDetailTab;
