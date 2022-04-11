import React from "react";
import TenderifySectionMapping from "./sections/Mapping";
import TenderifySectionSourceDocs from "./sections/Documents";
import { tabProptypes } from "../../utils/propTypes";

const TenderifySource = ({ ...props }) => (
  <>
    <TenderifySectionSourceDocs {...props} />
    <TenderifySectionMapping {...props} />
  </>
);

TenderifySource.propTypes = {
  ...tabProptypes
};

export default TenderifySource;
