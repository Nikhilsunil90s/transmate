import React from "react";

import { FileUploadSection } from "../sections";

const InvoiceUploadTab = ({ ...props }) => {
  return (
    <>
      <FileUploadSection {...props} />
    </>
  );
};

export default InvoiceUploadTab;
