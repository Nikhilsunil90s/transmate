import React from "react";
import TenderifySectionOffer from "./sections/Offer";
import TenderifySectionRequirements from "./sections/Requirements";

const TenderifyOfferTab = ({ ...props }) => (
  <>
    <TenderifySectionOffer {...props} />
    <TenderifySectionRequirements {...props} />
  </>
);

export default TenderifyOfferTab;
