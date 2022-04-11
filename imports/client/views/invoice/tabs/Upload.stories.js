import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import UploadTab from "./Upload.jsx";

export default {
  title: "Invoice/tabs/upload"
};

export const basic = () => {
  const props = {};

  //   mapping: dummyMapping,
  //   canEdit: true,
  //   costOptions
  // };

  return (
    <PageHolder main="PriceRequest">
      <UploadTab {...props} />
    </PageHolder>
  );
};
