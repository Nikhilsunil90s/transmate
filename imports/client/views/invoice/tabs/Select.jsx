import React from "react";

import { SelectShipmentsSection } from "../sections";

const InvoiceSelectShipmentsTab = ({ ...props }) => {
  return (
    <>
      {/* <Control />
      <AvailableShipmentsSection />*/}
      <SelectShipmentsSection {...props} />
    </>
  );
};

export default InvoiceSelectShipmentsTab;
