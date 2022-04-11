import React from "react";
import { tabProptypes } from "../../utils/propTypes";

import {
  TenderifyNumber,
  TenderifySectionGeneral,
  TenderifySectionPartner,
  TenderifySectionWorkflow,
  TenderifySectionAccessControl,
  TenderifySectionHistory
} from "./sections";

const TenderifyGeneral = ({ ...props }) => {
  return (
    <>
      <TenderifyNumber {...props} />
      <TenderifySectionGeneral {...props} />
      <TenderifySectionPartner {...props} />
      <TenderifySectionWorkflow {...props} />
      <TenderifySectionAccessControl {...props} />
      <TenderifySectionHistory {...props} />
    </>
  );
};

TenderifyGeneral.propTypes = {
  ...tabProptypes
};

export default TenderifyGeneral;
