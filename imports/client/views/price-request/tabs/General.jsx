import React from "react";
import { Container } from "semantic-ui-react";

import { General, Settings, Requirements } from "../sections";

import { tabPropTypes } from "./_tabProptypes";

const PriceRequestGeneralTab = ({ ...props }) => {
  const { security = {} } = props;

  // show warning for carriers trying to bid on a closed price request
  props.noBidMessage = !security.isOwner && !security.canPlaceBid;

  return (
    <Container fluid>
      {<General {...props} />}
      {<Settings {...props} />}
      <Requirements {...props} />
    </Container>
  );
};

PriceRequestGeneralTab.propTypes = tabPropTypes;

export default PriceRequestGeneralTab;
