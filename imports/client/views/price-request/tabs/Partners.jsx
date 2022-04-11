import React from "react";
import { Container } from "semantic-ui-react";

import { Partners } from "../sections";

const PriceRequestPartnersTab = ({ ...props }) => {
  return (
    <Container fluid>
      <Partners {...props} />
    </Container>
  );
};

export default PriceRequestPartnersTab;
