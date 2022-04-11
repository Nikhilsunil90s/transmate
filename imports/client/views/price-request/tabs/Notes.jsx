import React from "react";
import { Container } from "semantic-ui-react";

import { MasterNotes } from "../sections";
import { tabPropTypes } from "./_tabProptypes";

const PriceRequestNotesTab = ({ ...props }) => {
  return (
    <Container fluid>
      <MasterNotes {...props} />
    </Container>
  );
};

PriceRequestNotesTab.propTypes = tabPropTypes;

export default PriceRequestNotesTab;
