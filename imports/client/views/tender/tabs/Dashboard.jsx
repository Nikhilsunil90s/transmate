import React from "react";
import { SummarySection, BidderOverviewSection, BidderDetailSection } from "../segments";

const TenderDashboardTab = ({ ...props }) => {
  return (
    <>
      <SummarySection {...props} />
      <BidderOverviewSection {...props} />
      <BidderDetailSection {...props} />
    </>
  );
};

export default TenderDashboardTab;
