import React from "react";
import { NDARequirementSection, RequirementSection, BiddingOptionsSection } from "../segments";

const TenderRequirementsTab = ({ ...props }) => {
  const { security = {} } = props;

  return (
    <>
      <RequirementSection {...props} />
      {security.canModifyTenderSettings && <NDARequirementSection {...props} />}
      {security.canEditRequirement && <BiddingOptionsSection {...props} />}
    </>
  );
};

export default TenderRequirementsTab;
