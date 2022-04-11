import React from "react";

import OverviewHeader from "./OverviewHeader.jsx";

const OverviewPanelWrapper = props => {
  return (
    <>
      <OverviewHeader {...props} />
      {props.children}
    </>
  );
};

export default OverviewPanelWrapper;
