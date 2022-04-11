import React from "react";
import { Container } from "semantic-ui-react";

import { Analytics } from "../sections";
import { tabPropTypes } from "./_tabProptypes";

const PriceRequestAnalyticsTab = ({ ...props }) => {
  const { security = {} } = props;
  return <Container fluid>{security.isOwner ? <Analytics {...props} /> : "Not allowed"}</Container>;
};

PriceRequestAnalyticsTab.propTypes = tabPropTypes;

export default PriceRequestAnalyticsTab;
